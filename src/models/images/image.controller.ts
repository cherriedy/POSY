import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ImageService } from './image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import e from 'express';
import path from 'path';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import { FileValidationPipe } from './pipes';
import { DuplicateEntryException } from '../../common/exceptions';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ImageNotFoundException } from './exceptions';
import { ImageUrlTransformInterceptor } from './interceptors';
import { UploadImageDto } from './dto';

@ApiTags('Image')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Roles(Role.ADMIN)
@UseInterceptors(ImageUrlTransformInterceptor)
@Controller('image')
export class ImageController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(private readonly imageService: ImageService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get image metadata by ID',
    description: 'Returns metadata for a specific image by its unique ID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The unique identifier of the image.',
  })
  @ApiResponse({
    status: 200,
    description: 'Image metadata returned.',
    schema: {
      example: {
        id: '1',
        filename: '12345.png',
        originalName: 'photo.png',
        mimeType: 'image/png',
        size: 12345,
        path: './uploads/12345.png',
        entityType: 'product',
        entityId: 1,
        sessionId: 'session-uuid',
        isConfirmed: true,
        createdAt: '2026-01-25T12:00:00.000Z',
        updatedAt: '2026-01-25T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  async getImage(@Param('id') id: string) {
    return await this.imageService.getImageById(id);
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get all images by session ID',
    description: 'Returns all images associated with a specific session.',
  })
  @ApiParam({
    name: 'sessionId',
    type: String,
    description: 'The session identifier.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of images for the session.',
    schema: {
      example: [
        {
          id: '1',
          filename: '12345.png',
          originalName: 'photo.png',
          mimeType: 'image/png',
          size: 12345,
          path: './uploads/12345.png',
          entityType: 'product',
          entityId: 1,
          sessionId: 'session-uuid',
          isConfirmed: true,
          createdAt: '2026-01-25T12:00:00.000Z',
          updatedAt: '2026-01-25T12:00:00.000Z',
        },
      ],
    },
  })
  async getImagesBySession(@Param('sessionId') sessionId: string) {
    return await this.imageService.getImagesBySession(sessionId);
  }

  @Get('entity')
  @ApiOperation({
    summary: 'Get all images by entity type and entity ID',
    description:
      'Returns all images associated with a specific entity type and entity ID.',
  })
  @ApiQuery({
    name: 'entityType',
    type: String,
    required: true,
    description: 'Entity type (e.g., product)',
  })
  @ApiQuery({
    name: 'entityId',
    type: String,
    required: true,
    description: 'Entity ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of images for the entity.',
    schema: {
      example: [
        {
          id: '1',
          filename: '12345.png',
          originalName: 'photo.png',
          mimeType: 'image/png',
          size: 12345,
          path: './uploads/12345.png',
          entityType: 'product',
          entityId: 1,
          sessionId: 'session-uuid',
          isConfirmed: true,
          createdAt: '2026-01-25T12:00:00.000Z',
          updatedAt: '2026-01-25T12:00:00.000Z',
        },
      ],
    },
  })
  async getImagesByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return await this.imageService.getImagesByEntity(entityType, entityId);
  }

  @Post('upload')
  @ApiOperation({
    summary: 'Upload an image',
    description:
      'Uploads an image and associates it with a session (and optionally an entity).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Image file to upload (max 5MB, allowed types: jpeg, jpg, png, gif, webp)',
        },
        sessionId: {
          type: 'string',
          format: 'uuid',
          description: 'Session ID to group temporary images',
        },
        entityType: { type: 'string', description: 'Optional entity type' },
        entityId: { type: 'string', description: 'Optional entity ID' },
      },
      required: ['file', 'sessionId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully.',
    schema: {
      example: {
        id: '1',
        filename: '12345.png',
        originalName: 'photo.png',
        mimeType: 'image/png',
        size: 12345,
        path: './uploads/12345.png',
        entityType: 'product',
        entityId: 1,
        sessionId: 'session-uuid',
        isConfirmed: true,
        createdAt: '2026-01-25T12:00:00.000Z',
        updatedAt: '2026-01-25T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or validation failed.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename(
          req: e.Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) {
          const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, suffix + path.extname(file.originalname));
        },
      }),
    }),
  )
  async uploadImage(
    @Body() dto: UploadImageDto,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
  ) {
    try {
      return await this.imageService.uploadImage(
        file,
        dto.sessionId,
        dto.entityType,
        dto.entityId,
      );
    } catch (e) {
      if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('session/:sessionId/confirm')
  @ApiOperation({
    summary: 'Confirm all images in a session',
    description:
      'Confirms all images in a session and associates them with an entity.',
  })
  @ApiParam({ name: 'sessionId', type: String, description: 'Session ID' })
  @ApiQuery({
    name: 'entityType',
    type: String,
    required: false,
    description: 'Optional entity type',
  })
  @ApiQuery({
    name: 'entityId',
    type: String,
    required: false,
    description: 'Optional entity ID',
  })
  @ApiResponse({ status: 200, description: 'Session images confirmed.' })
  async confirmSession(
    @Param('sessionId') sessionId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    await this.imageService.confirmSession(sessionId, entityType, entityId);
  }

  @Post('session/:sessionId/cancel')
  @ApiOperation({
    summary: 'Cancel a session',
    description: 'Cancels a session and deletes all unconfirmed images in it.',
  })
  @ApiParam({ name: 'sessionId', type: String, description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session images cancelled and deleted.',
  })
  async cancelSession(@Param('sessionId') sessionId: string) {
    await this.imageService.cancelSession(sessionId);
  }

  @Delete(':id/delete')
  @ApiOperation({
    summary: 'Delete an image by ID',
    description: 'Deletes an image by its unique ID.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Image ID' })
  @ApiResponse({ status: 200, description: 'Image deleted.' })
  async deleteImage(@Param('id') id: string) {
    try {
      await this.imageService.deleteImage(id);
    } catch (e) {
      if (e instanceof ImageNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}

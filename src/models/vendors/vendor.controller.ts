import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { plainToInstance } from 'class-transformer';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import {
  DuplicateEntryException,
  MissingRequireFieldsException,
} from '../../common/exceptions';
import {
  VendorCreateRequestDto,
  VendorPreviewResponseDto,
  VendorDetailedResponseDto,
  VendorUpdateRequestDto,
  VendorQueryParamsDto,
} from './dto';
import {
  CreateVendorService,
  CreateVendorPayloadMapper,
} from './create-vendor';
import { GetVendorsService } from './get-vendors';
import {
  UpdateVendorService,
  UpdateVendorPayloadMapper,
} from './update-vendor';
import { DeleteVendorService } from './delete-vendor';
import { VendorNotFoundException } from './exceptions';
import { Page } from '../../common/interfaces';
import { createPageResponseSchema } from '../../common/dto';

@ApiTags('Vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly createVendorService: CreateVendorService,
    private readonly getVendorsService: GetVendorsService,
    private readonly updateVendorService: UpdateVendorService,
    private readonly deleteVendorService: DeleteVendorService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all vendors',
    description: `Returns a paginated list of all vendors. Accessible by MANAGER and ADMIN roles.
    Supports filtering by query parameters such as search query (by name, contact, address), status, etc.
    Used for listing and searching vendors.`,
  })
  @ApiQuery({ name: 'query', required: false, type: VendorQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of vendors',
    schema: createPageResponseSchema(VendorPreviewResponseDto),
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getAll(
    @Query() query: VendorQueryParamsDto,
  ): Promise<Page<VendorPreviewResponseDto>> {
    try {
      const queryParams = query.toQueryParams();
      const vendorPage = await this.getVendorsService.getAll(queryParams);

      const vendorPreviewItems = plainToInstance(
        VendorPreviewResponseDto,
        vendorPage.items,
        { excludeExtraneousValues: true },
      );

      return {
        ...vendorPage,
        items: vendorPreviewItems,
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    type: VendorDetailedResponseDto,
    description: 'Vendor retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Vendor not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<VendorDetailedResponseDto> {
    try {
      const vendor = await this.getVendorsService.getById(id);
      return plainToInstance(VendorDetailedResponseDto, vendor, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof VendorNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a vendor' })
  @ApiBody({ type: VendorCreateRequestDto })
  @ApiResponse({
    status: 201,
    type: VendorDetailedResponseDto,
    description: 'Vendor created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Duplicate vendor.' })
  @ApiResponse({ status: 400, description: 'Missing required fields.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(
    @Body() dto: VendorCreateRequestDto,
  ): Promise<VendorDetailedResponseDto> {
    try {
      const payload = CreateVendorPayloadMapper.fromDto(dto);
      const vendor = await this.createVendorService.create(payload);
      return plainToInstance(VendorDetailedResponseDto, vendor, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (
        e instanceof DuplicateEntryException ||
        e instanceof MissingRequireFieldsException
      ) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: VendorUpdateRequestDto })
  @ApiResponse({
    status: 200,
    type: VendorDetailedResponseDto,
    description: 'Vendor updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Vendor not found or duplicate.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: VendorUpdateRequestDto,
  ): Promise<VendorDetailedResponseDto> {
    try {
      const payload = UpdateVendorPayloadMapper.fromDto(dto);
      const vendor = await this.updateVendorService.update(id, payload);
      return plainToInstance(VendorDetailedResponseDto, vendor, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof DuplicateEntryException) {
        throw new BadRequestException(e.message);
      }
      if (e instanceof VendorNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a vendor' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Vendor not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ message: string }> {
    try {
      await this.deleteVendorService.delete(id);
      return { message: 'Vendor deleted successfully.' };
    } catch (e) {
      if (e instanceof VendorNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}

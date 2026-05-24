import {
  Body,
  Controller,
  Delete,
  Get,
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
import { plainToInstance } from 'class-transformer';
import { RoleGuard } from '@posy/auth';
import { Roles } from '@posy/shared';
import { Role } from '@posy/shared';
import { VendorCreateRequestDto } from '@posy/vendors/shared/dto/vendor-create-request.dto';
import { VendorPreviewResponseDto } from '@posy/vendors/shared/dto/vendor-preview-response.dto';
import { VendorDetailedResponseDto } from '@posy/vendors/shared/dto/vendor-detailed-response.dto';
import { VendorUpdateRequestDto } from '@posy/vendors/shared/dto/vendor-update-request.dto';
import { VendorQueryParamsDto } from '@posy/vendors/shared/dto/vendor-query-params.dto';
import { CreateVendorService } from '@posy/vendors/features/create-vendor/create-vendor.service';
import { CreateVendorPayloadMapper } from '@posy/vendors/features/create-vendor/create-vendor-payload.mapper';
import { GetVendorsService } from '@posy/vendors/features/get-vendors/get-vendors.service';
import { UpdateVendorService } from '@posy/vendors/features/update-vendor/update-vendor.service';
import { UpdateVendorPayloadMapper } from '@posy/vendors/features/update-vendor/update-vendor-payload.mapper';
import { DeleteVendorService } from '@posy/vendors/features/delete-vendor/delete-vendor.service';
import { Page } from '@posy/shared';
import { createPageResponseSchema } from '@posy/shared';

@ApiTags('Vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorController {
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
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<VendorDetailedResponseDto> {
    const vendor = await this.getVendorsService.getById(id);
    return plainToInstance(VendorDetailedResponseDto, vendor, {
      excludeExtraneousValues: true,
    });
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
    const payload = CreateVendorPayloadMapper.fromDto(dto);
    const vendor = await this.createVendorService.create(payload);
    return plainToInstance(VendorDetailedResponseDto, vendor, {
      excludeExtraneousValues: true,
    });
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
    const payload = UpdateVendorPayloadMapper.fromDto(dto);
    const vendor = await this.updateVendorService.update(id, payload);
    return plainToInstance(VendorDetailedResponseDto, vendor, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a vendor' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Vendor not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    await this.deleteVendorService.delete(id);
    return { message: 'Vendor deleted successfully.' };
  }
}

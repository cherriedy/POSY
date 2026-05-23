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
import { RoleGuard } from '../../authorization/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { VendorCreateRequestDto } from './dto/vendor-create-request.dto';
import { VendorPreviewResponseDto } from './dto/vendor-preview-response.dto';
import { VendorDetailedResponseDto } from './dto/vendor-detailed-response.dto';
import { VendorUpdateRequestDto } from './dto/vendor-update-request.dto';
import { VendorQueryParamsDto } from './dto/vendor-query-params.dto';
import { CreateVendorService } from './create-vendor/create-vendor.service';
import { CreateVendorPayloadMapper } from './create-vendor/create-vendor-payload.mapper';
import { GetVendorsService } from './get-vendors/get-vendors.service';
import { UpdateVendorService } from './update-vendor/update-vendor.service';
import { UpdateVendorPayloadMapper } from './update-vendor/update-vendor-payload.mapper';
import { DeleteVendorService } from './delete-vendor/delete-vendor.service';
import { Page } from '../../common/interfaces/page.interface';
import { createPageResponseSchema } from '../../common/dto/page-response';

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

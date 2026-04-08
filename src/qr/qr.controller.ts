import {
  Controller,
  Inject,
  InternalServerErrorException,
  LoggerService,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QrService } from './qr.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TableNotFoundException } from '../models/tables/exceptions';
import { RoleGuard } from '../authorization/guards/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums';

@UseGuards(AuthGuard('jwt'), RoleGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@ApiTags('QR')
@Controller('qr')
export class QrController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(private readonly qrService: QrService) {}

  @Post(':id/refresh')
  @ApiOperation({
    summary: 'Refresh QR for a table',
    description:
      'Regenerate a new QR token for the specified table and publish it via MQTT.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'QR code refreshed successfully',
    schema: { example: { message: 'QR code refreshed successfully' } },
  })
  @ApiNotFoundResponse({ description: 'Table not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async refreshQr(@Param('id', new ParseUUIDPipe()) tableId: string) {
    try {
      await this.qrService.refreshTableQr(tableId);
      return { message: `QR code refreshed successfully` };
    } catch (e) {
      if (e instanceof TableNotFoundException) {
        throw new NotFoundException(e.message);
      }
      this.logger.error(
        `Failed to refresh QR for table ${tableId}`,
        e instanceof Error ? e.stack : JSON.stringify(e),
      );
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}

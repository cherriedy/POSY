import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { GuestSessionContextService } from './features';
import { EndSessionService } from './features/end-session/end-session.service';
import { StartSessionRequestDto, TableSessionResponseDto } from './shared';
import { TableSessionConfig } from './table-session.config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { assertDevice, InvalidDeviceException } from '../../common/interfaces';

@ApiTags('Sessions')
@Controller('session')
export class TableSessionController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: Logger;

  constructor(
    private readonly guestSessionContextService: GuestSessionContextService,
    private readonly endSessionService: EndSessionService,
    private readonly tableSessionConfig: TableSessionConfig,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a new table session by scanning QR code' })
  @ApiOkResponse({
    description: 'Session started successfully',
    type: TableSessionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Table not found' })
  async startSession(
    @Body() dto: StartSessionRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TableSessionResponseDto> {
    if (!req.ip) {
      throw new BadRequestException('Unable to determine client IP address');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userAgent = req['device'];
    try {
      assertDevice(userAgent);
    } catch (e) {
      if (e instanceof InvalidDeviceException) {
        throw new BadRequestException(e.message);
      }
    }

    const session = await this.guestSessionContextService.execute(
      userAgent,
      req.ip,
      dto.tableId,
    );
    if (!session) {
      throw new BadRequestException(
        'An active session already exists for this table from a different device',
      );
    }

    // Set HTTP-only cookie with session token
    res.cookie(this.tableSessionConfig.cookie.name, session.sessionToken, {
      httpOnly: this.tableSessionConfig.cookie.httpOnly,
      secure: this.tableSessionConfig.cookie.secure,
      sameSite: this.tableSessionConfig.cookie.sameSite,
      path: this.tableSessionConfig.cookie.path,
      maxAge: this.tableSessionConfig.jwt.expiresIn,
    });

    return {
      id: session.id!,
      table: {
        id: session.tableId,
        name: session.table!.name,
      },
      status: session.status,
      startAt: session.startAt,
    };
  }

  // @Post('end')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(SessionGuard)
  // @ApiCookieAuth('session_token')
  // @ApiOperation({ summary: 'End the current table session' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Session ended successfully',
  // })
  // @ApiResponse({
  //   status: 401,
  //   description: 'Invalid or expired session token',
  // })
  // async endSession(
  //   @Req() req: Request,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<void> {
  //   const cookieName = this.tableSessionConfig.cookie.name;
  //   const sessionToken = req.cookies[cookieName] as string;
  //
  //   await this.endSessionService.execute(sessionToken);
  //
  //   // Clear the session cookie
  //   res.clearCookie(this.tableSessionConfig.cookie.name, {
  //     path: this.tableSessionConfig.cookie.path,
  //   });
  // }
}

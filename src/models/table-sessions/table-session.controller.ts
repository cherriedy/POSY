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
  Get,
  Query,
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

    const userAgent = req['device'] as string;
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
      dto.tableToken,
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
      maxAge: this.tableSessionConfig.jwt.expiresIn * 1000, // expiresIn is in seconds; maxAge expects milliseconds
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

  @Get('end')
  @HttpCode(HttpStatus.OK)
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
  async endSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const cookieName = this.tableSessionConfig.cookie.name;
    const sessionToken = req.cookies[cookieName] as string;

    await this.endSessionService.execute(sessionToken);

    // Clear the session cookie
    res.clearCookie(this.tableSessionConfig.cookie.name, {
      path: this.tableSessionConfig.cookie.path,
    });
  }

  @Get('test-scan')
  async testScanDirectly(
    @Query('tableId') tableId: string,
    @Query('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!tableId || !token) {
      return res
        .status(400)
        .send('<h2 style="color:red">Lỗi: URL thiếu tham số!</h2>');
    }

    if (!req.ip) {
      throw new BadRequestException('Unable to determine client IP address');
    }

    const userAgent = req['device'] as string;
    try {
      assertDevice(userAgent);
    } catch (e) {
      if (e instanceof InvalidDeviceException) {
        throw new BadRequestException(e.message);
      }
    }

    const result = await this.guestSessionContextService.execute(
      userAgent,
      req.ip,
      tableId,
      token,
    );
    if (!result) {
      throw new BadRequestException(
        'An active session already exists for this table from a different device',
      );
    }

    try {
      // Set HTTP-only cookie with session token
      res.cookie(this.tableSessionConfig.cookie.name, result.sessionToken, {
        httpOnly: this.tableSessionConfig.cookie.httpOnly,
        secure: this.tableSessionConfig.cookie.secure,
        sameSite: this.tableSessionConfig.cookie.sameSite,
        path: this.tableSessionConfig.cookie.path,
        maxAge: this.tableSessionConfig.jwt.expiresIn * 1000, // expiresIn is in seconds; maxAge expects milliseconds
      });
      // Return HTML result (no emoji)
      return res.send(`
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 40px; background: #f0f8ff; height: 100vh;"><h1 style="color: #27ae60;">QUÉT THÀNH CÔNG!</h1>
          <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px;">
            <p style="font-size: 18px;"><strong>Trạng thái:</strong> ${result.status}</p>
            <p style="color: #666; word-break: break-all;"><strong>Session ID:</strong><br/> ${result.id ?? result['id']}</p>
            <p style="color: #666;"><strong>Fingerprint:</strong><br/> ${result.deviceFingerprint}</p>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #888;">
            *Hệ thống đã chạy qua Prisma và xử lý thành công logic kiểm tra Token.
          </p>
        </div>
      `);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        e && typeof e.message === 'string' ? e.message : 'Lỗi không xác định';
      return res.status(500).send(`
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 40px; background: #fff0f0; height: 100vh;">
          <h1 style="color: #e74c3c;">LỖI XÁC THỰC</h1>
          <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px; border: 2px solid #e74c3c;">
            <p style="font-size: 18px; font-weight: bold;">${message}</p>
          </div>
        </div>
      `);
    }
  }
}

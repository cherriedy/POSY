import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StartSessionService } from './start-session/start-session.service';
import { EndSessionService } from './end-session/end-session.service';
import { StartSessionRequestDto, TableSessionResponseDto } from './dto';
import { SessionGuard } from './guards';
import { TableSessionConfig } from './table-session.config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OptionalJwtGuard } from '../../common/guards';
import { JwtPayload } from '../../authentication/interfaces';

@ApiTags('Sessions')
@Controller('session')
export class TableSessionController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly startSessionService: StartSessionService,
    private readonly endSessionService: EndSessionService,
    private readonly tableSessionConfig: TableSessionConfig,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Start a new table session by scanning QR code',
    description: `Customers scan a QR code to start a session (no auth required). 
    Staff may also start a session by providing a valid Bearer token, which associates 
    their user ID with the session.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Session started successfully',
    type: TableSessionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Table not found',
  })
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
    if (
      !userAgent ||
      typeof userAgent !== 'string' ||
      userAgent === 'Unknown device'
    ) {
      throw new BadRequestException(
        'Unable to determine client device information',
      );
    }

    // If the request is made by an authenticated staff member, associate
    // their user ID with the session; otherwise leave it undefined (guest).
    const staff = req.user as JwtPayload | undefined;
    const userId = staff?.sub;

    const session = await this.startSessionService.execute(
      userAgent,
      req.ip,
      dto.tableId,
      userId,
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

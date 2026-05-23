import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

const STATUS_MAP: Record<string, number> = {
  // 400 Bad Request
  MissingRequiredFieldsError: HttpStatus.BAD_REQUEST,
  DuplicateEntryError: HttpStatus.BAD_REQUEST,
  PromotionUnusableError: HttpStatus.BAD_REQUEST,
  UnnecessaryOperationError: HttpStatus.BAD_REQUEST,
  CategoriesNotFoundException: HttpStatus.BAD_REQUEST,
  ProductsNotFoundException: HttpStatus.BAD_REQUEST,
  OrderNotFoundException: HttpStatus.BAD_REQUEST,
  OrderSnapshotNotFoundException: HttpStatus.BAD_REQUEST,
  OrderNotReadyForCheckoutException: HttpStatus.BAD_REQUEST,
  AtLeastOneItemRequiredException: HttpStatus.BAD_REQUEST,
  UnsupportedValueError: HttpStatus.BAD_REQUEST,
  InvalidDeviceException: HttpStatus.BAD_REQUEST,
  RelatedRecordNotFoundError: HttpStatus.BAD_REQUEST,
  // 401 Unauthorized
  InvalidCredentialsError: HttpStatus.UNAUTHORIZED,
  InvalidAccessTokenError: HttpStatus.UNAUTHORIZED,
  AccessTokenExpiredError: HttpStatus.UNAUTHORIZED,
  InvalidRefreshTokenError: HttpStatus.UNAUTHORIZED,
  InvalidResetCodeError: HttpStatus.UNAUTHORIZED,
  InvalidResetTokenError: HttpStatus.UNAUTHORIZED,
  RefreshTokenExpiredError: HttpStatus.UNAUTHORIZED,
  ResetCodeExpiredError: HttpStatus.UNAUTHORIZED,
  ResetTokenExpiredError: HttpStatus.UNAUTHORIZED,
  // 403 Forbidden
  AccountLockedError: HttpStatus.FORBIDDEN,
  OrderModificationForbiddenException: HttpStatus.FORBIDDEN,
  // 404 Not Found
  ProductNotFoundError: HttpStatus.NOT_FOUND,
  UserNotFoundError: HttpStatus.NOT_FOUND,
  OrderNotFoundError: HttpStatus.NOT_FOUND,
  ImageNotFoundError: HttpStatus.NOT_FOUND,
  PromotionNotFoundError: HttpStatus.NOT_FOUND,
  PromotionCategoryNotFoundError: HttpStatus.NOT_FOUND,
  PromotionProductNotFoundError: HttpStatus.NOT_FOUND,
  CategoryNotFoundException: HttpStatus.NOT_FOUND,
  ProductNotFoundException: HttpStatus.NOT_FOUND,
  FloorNotFoundException: HttpStatus.NOT_FOUND,
  OrderNotFoundWithProvidedSessionException: HttpStatus.NOT_FOUND,
  PaymentNotFoundException: HttpStatus.NOT_FOUND,
  PaymentMethodNotFoundException: HttpStatus.NOT_FOUND,
  TableNotFoundException: HttpStatus.NOT_FOUND,
  ZoneNotFoundException: HttpStatus.NOT_FOUND,
  CuisineNotFoundException: HttpStatus.NOT_FOUND,
  IngredientNotFoundException: HttpStatus.NOT_FOUND,
  TaxNotFoundException: HttpStatus.NOT_FOUND,
  UnitNotFoundException: HttpStatus.NOT_FOUND,
  VendorNotFoundException: HttpStatus.NOT_FOUND,
  // 409 Conflict
  ForeignKeyViolationError: HttpStatus.CONFLICT,
  InsufficientRequiredIngredientException: HttpStatus.CONFLICT,
};

@Catch(Error)
export class DomainErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainErrorFilter.name);

  catch(error: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Pass through NestJS HTTP exceptions (guards, pipes, explicit throws)
    if (error instanceof HttpException) {
      response.status(error.getStatus()).json(error.getResponse());
      return;
    }

    const status = STATUS_MAP[error.name];

    if (!status) {
      this.logger.error(error.message, error.stack);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
      return;
    }

    response.status(status).json({
      statusCode: status,
      message: error.message,
    });
  }
}

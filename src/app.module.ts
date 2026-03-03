import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CategoryModule } from './models/categories/category.module';
import { CuisineModule } from './models/cuisines/cuisine.module';
import { AuthModule } from './authentication/auth.module';
import { UserModule } from './models/users/user.module';
import { MailModule } from './mails/mail.module';
import {
  AppConfigModule,
  DatabaseConfigModule,
  JwtConfigModule,
  MailerSendConfigModule,
  MeilisearchConfigModule,
  RedisConfigModule,
} from './config';
import { LoggerModule } from './logger/logger.module';
import { DeviceContextMiddleware } from './common/middleware/device-context.middleware';
import { AuthorizationModule } from './authorization/authorization.module';
import { MyProfileModule } from './my-profile/my-profile.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { ActivityLogModule } from './models/activity-log/activity-log.module';
import { CommonModule } from './common/common.module';
import { PromotionModule } from './models/promotions/promotion.module';
import { ProductModule } from './models/products/product.module';
import { MeilisearchModule } from './providers/meilisearch/meilisearch.module';
import { ImageModule } from './models/images/image.module';
import { TaxModule } from './models/taxes/tax.module';
import { OrderModule } from './models/orders/order.module';
import { PaymentModule } from './models/payments/payment.module';
import { TableModule } from './models/tables/table.module';
import { FloorModule } from './models/floors/floor.module';
import { ZoneModule } from './models/zones/zone.module';
import { TableSessionModule } from './models/table-sessions/table-session.module';
import { UserTrackingModule } from './user-tracking';
import { RedisModule } from './providers/redis';
import { IngredientModule } from './models/ingredients';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot(),
    AppConfigModule,
    DatabaseConfigModule,
    JwtConfigModule,
    MailerSendConfigModule,
    UserModule,
    CategoryModule,
    CuisineModule,
    AuthModule,
    MailModule,
    LoggerModule,
    AuthorizationModule,
    MyProfileModule,
    ActivityLogModule,
    CommonModule,
    PromotionModule,
    ProductModule,
    MeilisearchConfigModule,
    MeilisearchModule,
    ImageModule,
    TaxModule,
    OrderModule,
    PaymentModule,
    TableModule,
    FloorModule,
    ZoneModule,
    TableSessionModule,
    UserTrackingModule,
    RedisModule,
    RedisConfigModule,
    IngredientModule,
  ],
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ActivityLogInterceptor,
    // },
    // {
    //   provide: 'REDIS_CLIENT',
    //   useFactory: () => {
    //     return new Redis({
    //       host: process.env.REDIS_HOST!,
    //       port: parseInt(process.env.REDIS_PORT!, 10),
    //     });
    //   },
    // },
  ],
  // exports: ['REDIS_CLIENT'],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DeviceContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

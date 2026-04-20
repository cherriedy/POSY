import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CategoryModule } from './models/categories';
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
  MomoConfigModule,
  RedisConfigModule,
} from './config';
import { LoggerModule } from './logger/logger.module';
import { DeviceContextMiddleware } from './common/middleware';
import { AuthorizationModule } from './authorization/authorization.module';
import { MyProfileModule } from './my-profile/my-profile.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { PromotionModule } from './models/promotions/promotion.module';
import { ProductModule } from './models/products';
import { MeilisearchModule } from './providers/meilisearch/meilisearch.module';
import { ImageModule } from './models/images/image.module';
import { TaxModule } from './models/taxes';
import { OrderModule } from './models/orders';
import { PaymentModule } from './models/payments/payment.module';
import { TableModule } from './models/tables/table.module';
import { FloorModule } from './models/floors/floor.module';
import { ZoneModule } from './models/zones/zone.module';
import { TableSessionModule } from './models/table-sessions';
import { UserTrackingModule } from './user-tracking/user-tracking.module';
import { RedisModule } from './providers/redis';
import { IngredientModule } from './models/ingredients';
import { RecommendationModule } from './recommendation/recommendation.module';
import { PythonConfigModule } from './config/python/config.module';
import { MqttModule } from './providers/mqtt/mqtt.module';
import { QrModule } from './qr/qr.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot(),
    AppConfigModule,
    DatabaseConfigModule,
    JwtConfigModule,
    MailerSendConfigModule,
    CommonModule,
    AuthorizationModule,
    MailModule,
    LoggerModule,
    AuthModule,
    UserModule,
    MyProfileModule,
    CategoryModule,
    MeilisearchConfigModule,
    MeilisearchModule,
    ProductModule,
    ImageModule,
    CuisineModule,
    FloorModule,
    ZoneModule,
    TableModule,
    TableSessionModule,
    PromotionModule,
    TaxModule,
    OrderModule,
    PaymentModule,
    UserTrackingModule,
    RedisModule,
    RedisConfigModule,
    MomoConfigModule,
    IngredientModule,
    PythonConfigModule,
    RecommendationModule,
    MqttModule,
    QrModule,
    InventoryModule,
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

import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CategoryModule } from './models/categories/category.module';
import { CuisineModule } from './models/cuisines/cuisine.module';
import { AuthApiModule } from './modules/auth/auth-api.module';
import { UserModule } from './models/users/user.module';
import { MailModule } from '@posy/shared';
import { AppConfigModule } from '@posy/shared';
import { DatabaseConfigModule } from '@posy/shared';
import { JwtConfigModule } from '@posy/shared';
import { MailerSendConfigModule } from '@posy/shared';
import { MeilisearchConfigModule } from '@posy/shared';
import { MomoConfigModule } from '@posy/shared';
import { RedisConfigModule } from '@posy/shared';
import { LoggerModule } from '@posy/shared';
import { DeviceContextMiddleware } from '@posy/shared';
import { AuthorizationModule } from '@posy/auth';
import { MyProfileModule } from './my-profile/my-profile.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from '@posy/shared';
import { PromotionModule } from './models/promotions/promotion.module';
import { ProductModule } from './models/products/product.module';
import { MeilisearchModule } from '@posy/shared';
import { ImageModule } from './models/images/image.module';
import { TaxModule } from './models/taxes/tax.module';
import { OrderModule } from './models/orders/order.module';
import { PaymentModule } from './models/payments/payment.module';
import { TableModule } from './models/tables/table.module';
import { FloorModule } from './models/floors/floor.module';
import { ZoneModule } from './models/zones/zone.module';
import { TableSessionModule } from './models/table-sessions/table-session.module';
import { UserTrackingModule } from './user-tracking/user-tracking.module';
import { RedisModule } from '@posy/shared';
import { VendorModule } from './models/vendors/vendor.module';
import { UnitModule } from './models/units/unit.module';
import { IngredientModule } from './models/ingredients/ingredient.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { PythonConfigModule } from '@posy/shared';
import { MqttModule } from '@posy/shared';
import { QrModule } from './qr/qr.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' }),
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
    AuthApiModule,
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
    VendorModule,
    UnitModule,
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

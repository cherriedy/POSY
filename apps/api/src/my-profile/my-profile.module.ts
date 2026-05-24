import { Module } from '@nestjs/common';
import { MyProfileController } from './my-profile.controller';
import { UserModule } from '../models/users/user.module';
import { GetUsersModule } from '@posy/users/features/get-users/get-users.module';
import { UpdateUserModule } from '@posy/users/features/update-user/update-user.module';
import { LoggerModule } from '@posy/shared';

@Module({
  imports: [UserModule, GetUsersModule, UpdateUserModule, LoggerModule],
  controllers: [MyProfileController],
})
export class MyProfileModule {}

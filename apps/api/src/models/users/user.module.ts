import { Global, Module } from '@nestjs/common';
import { UserRepository } from '@posy/users/shared/repositories/user-repository.abstract';
import { PrismaUserRepository } from '@posy/users/shared/repositories/prisma-user-repository';
import { CreateUserModule } from '@posy/users/features/create-user/create-user.module';
import { UserController } from './user.controller';
import { UpdateUserModule } from '@posy/users/features/update-user/update-user.module';
import { DeleteUserModule } from '@posy/users/features/delete-user/delete-user.module';
import { GetUsersModule } from '@posy/users/features/get-users/get-users.module';
import { PreventManagerAdminAccessGuard } from './guards/prevent-manager-admin-access.guard';

@Global()
@Module({
  providers: [
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    PreventManagerAdminAccessGuard,
  ],
  imports: [
    CreateUserModule,
    UpdateUserModule,
    DeleteUserModule,
    GetUsersModule,
  ],
  controllers: [UserController],
  exports: [UserRepository],
})
export class UserModule {}

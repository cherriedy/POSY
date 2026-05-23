import { Global, Module } from '@nestjs/common';
import { UserRepository } from './repositories/user-repository.abstract';
import { PrismaUserRepository } from './repositories/prisma-user-repository';
import { CreateUserModule } from './create-user/create-user.module';
import { UserController } from './user.controller';
import { UpdateUserModule } from './update-user/update-user.module';
import { DeleteUserModule } from './delete-user/delete-user.module';
import { GetUsersModule } from './get-users/get-users.module';
import { PreventManagerAdminAccessGuard } from '../../authorization/guards/prevent-manager-admin-access.guard';

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

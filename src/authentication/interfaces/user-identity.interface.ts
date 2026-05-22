import { Role } from '../../common/enums/role.enum';

export interface UserIdentity {
  id: string;
  role: Role;
}

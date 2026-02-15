import { getSlug } from '../../../common/utilities/string.util';

export class Category {
  constructor(
    public id: string | null,
    public name: string,
    public slug: string | null,
    public description: string | null,
    public isActive: boolean,
    public isDeleted: boolean = false,
    public deletedAt: Date | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}
}

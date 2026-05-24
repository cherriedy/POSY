export class Unit {
  constructor(
    public id?: string,
    public name?: string,
    public abbreviation?: string,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,
  ) {}
}

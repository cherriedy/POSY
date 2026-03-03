export class Unit {
  constructor(
    public id: string | null,
    public name: string,
    public abbreviation: string,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}
}

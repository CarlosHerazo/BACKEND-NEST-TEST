export class DiscountCode {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly discountPercentage: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    code: string;
    discountPercentage: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): DiscountCode {
    return new DiscountCode(
      props.id,
      props.code.toUpperCase(),
      props.discountPercentage,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  calculateDiscount(subtotalInCents: number): number {
    return Math.floor(subtotalInCents * (this.discountPercentage / 100));
  }
}

export const DISCOUNT_CODE_REPOSITORY = Symbol('IDiscountCodeRepository');

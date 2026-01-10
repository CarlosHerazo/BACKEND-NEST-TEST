export class Price {
  private constructor(private readonly value: number) {}

  static create(value: number): Price {
    if (value < 0) {
      throw new Error('Price cannot be negative');
    }

    if (!this.hasTwoDecimalsOrLess(value)) {
      throw new Error('Price can have at most 2 decimal places');
    }

    return new Price(value);
  }

  getValue(): number {
    return this.value;
  }

  private static hasTwoDecimalsOrLess(value: number): boolean {
    return Number.isInteger(value * 100);
  }
}

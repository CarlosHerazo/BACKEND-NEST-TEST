/**
 * Customer Domain Entity
 * Represents a customer in the domain layer
 */
export class Customer {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly phone: string,
    public readonly address: string,
    public readonly city: string,
    public readonly country: string,
    public readonly postalCode: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Factory method to create a new customer
   */
  static create(
    id: string,
    email: string,
    fullName: string,
    phone: string,
    address: string,
    city: string,
    country: string,
    postalCode: string,
  ): Customer {
    const now = new Date();
    return new Customer(
      id,
      email,
      fullName,
      phone,
      address,
      city,
      country,
      postalCode,
      now,
      now,
    );
  }

  /**
   * Update customer information
   */
  update(data: Partial<CustomerUpdateData>): Customer {
    return new Customer(
      this.id,
      data.email ?? this.email,
      data.fullName ?? this.fullName,
      data.phone ?? this.phone,
      data.address ?? this.address,
      data.city ?? this.city,
      data.country ?? this.country,
      data.postalCode ?? this.postalCode,
      this.createdAt,
      new Date(),
    );
  }
}

export interface CustomerUpdateData {
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

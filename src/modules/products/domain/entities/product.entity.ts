/** 
 * Prduct Entity
 * Represents a product in the domain layer
 */
/**
 * Product Entity
 * Represents a product in the domain layer
 */
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly imgUrl: string,
    public readonly images: string[] | null,
    public readonly price: number,
    public readonly stock: number,
    public readonly category: string | null,
    public readonly rating: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Factory method to create a new product
   */
  static create(
    id: string,
    name: string,
    description: string,
    imgUrl: string,
    price: number,
    stock: number,
    category?: string | null,
    rating?: number | null,
    images?: string[] | null,
  ): Product {
    const now = new Date();
    return new Product(
      id,
      name,
      description,
      imgUrl,
      images ?? null,
      price,
      stock,
      category ?? null,
      rating ?? null,
      now,
      now,
    );
  }

  /**
   * Update product information
   */
  update(data: Partial<ProductUpdateData>): Product {
    return new Product(
      this.id,
      data.name ?? this.name,
      data.description ?? this.description,
      data.imgUrl ?? this.imgUrl,
      data.images !== undefined ? data.images : this.images,
      data.price ?? this.price,
      data.stock ?? this.stock,
      data.category !== undefined ? data.category : this.category,
      data.rating !== undefined ? data.rating : this.rating,
      this.createdAt,
      new Date(),
    );
  }
}


export interface ProductUpdateData {
    name: string;
    description: string;
    imgUrl: string;
    images: string[] | null;
    price: number;
    stock: number;
    category: string | null;
    rating: number | null;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
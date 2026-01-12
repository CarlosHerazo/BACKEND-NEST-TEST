import { Inject, Injectable, Logger } from "@nestjs/common";
import type { IProductRepository } from "../../domain/ports/product.repository.port";
import { Product, PRODUCT_REPOSITORY } from "../../domain/entities/product.entity";
import { CreateProductDto } from "../dtos/create-product.dto";
import { Result } from "../../../../shared/domain/result";
import { randomUUID } from "crypto";
import { Price } from "../../domain/value-objects/price.value.object";

@Injectable()
export class CreateProductUseCase {
  private readonly logger = new Logger(CreateProductUseCase.name); // ✅ inicializado correctamente
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}
  
  async execute(dto: CreateProductDto): Promise<Result<Product, Error>> {
    this.logger.log(`Creating product with name: ${dto.name}`);

    // validar el precio
    try {
      if (dto.price < 0) {
        Price.create(dto.price);   
      }
    } catch (error) {
      return Result.fail(new Error(error.message));
    }

    try {
        // Create product entity
        const product = Product.create(
          randomUUID(),
          dto.name,
          dto.description,
          dto.imgUrl,
          dto.price,
          dto.stock,
          dto.category ?? null,
          dto.rating ?? null,
          dto.images ?? null,
        );
        return this.productRepository.create(product);
    } catch (error) {
        return Result.fail(new Error(error.message));
    }
  }
}

import { Inject, Injectable, Logger } from "@nestjs/common";
import { Product, PRODUCT_REPOSITORY } from "../../domain/entities/product.entity";
import type { IProductRepository } from "../../domain/ports/product.repository.port";
import { UpdateProductDto } from "../dtos/update-product.dto";
import { Price } from "../../domain/value-objects/price.value.object";
import { Result } from "../../../../shared/domain/result";

@Injectable()
export class UpdateProductUseCase {
  private readonly logger = new Logger(UpdateProductUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string, dto: UpdateProductDto): Promise<Result<Product, Error>> {
    this.logger.log(`Updating product with id: ${id}`);
    const findResult = await this.productRepository.findById(id);

    return await findResult.match<Promise<Result<Product, Error>>>(
      async (product) => {
        try {
          if (dto.price !== undefined) Price.create(dto.price);
        } catch (error) {
          this.logger.error('Validation error', error.message);
          return Result.fail(new Error(error.message));
        }

        const updatedProduct = product.update({
          name: dto.name,
          description: dto.description,
          imgUrl: dto.imgUrl,
          price: dto.price,
          stock: dto.stock,
          category: dto.category,
          rating: dto.rating,
        });

        const updateResult = await this.productRepository.update(updatedProduct);

        return updateResult.match(
          (p) => Result.ok(p),
          (err) => Result.fail(err),
        );
      },
      async (error) => Result.fail(error),
    );
  }
}

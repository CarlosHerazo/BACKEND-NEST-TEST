import { Inject, Injectable, Logger } from "@nestjs/common";
import { Product, PRODUCT_REPOSITORY } from "../../domain/entities/product.entity";
import type { IProductRepository } from "../../domain/ports/product.repository.port";
import { Result } from "../../../../shared/domain/result";

/**
 * Use Case: Get Product By ID
 * Retrieves a product by its unique identifier
 */

@Injectable()
export class GetProductByIdUseCase {
    private readonly logger = new Logger(GetProductByIdUseCase.name);
    
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
    ) {}

    async execute(id: string): Promise<Result<Product, Error>> {
        this.logger.log(`Retrieving product with id: ${id}`);
        if (!id || id.trim() === '') {
            return Result.fail(new Error('Product ID is required'));
        }
        return await this.productRepository.findById(id);
    }
}
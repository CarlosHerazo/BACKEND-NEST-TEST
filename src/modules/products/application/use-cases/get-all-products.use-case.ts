import { Inject, Injectable, Logger } from "@nestjs/common";
import { Product, PRODUCT_REPOSITORY } from "../../domain/entities/product.entity";
import type { IProductRepository } from "../../domain/ports/product.repository.port";
import { Result } from "../../../../shared/domain/result";


@Injectable()
export class GetAllProductsUseCase {
    private readonly logger = new Logger(GetAllProductsUseCase.name);

    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
    ){}

    async execute(): Promise<Result<Product[], Error>> {
        this.logger.log('Retrieving all products');
        return await this.productRepository.findAll();
    }
}
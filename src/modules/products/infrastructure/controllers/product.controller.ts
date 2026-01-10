import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';
import { GetAllProductsUseCase } from '../../application/use-cases/get-all-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import  { ProductResponseDto } from '../../application/dtos/product-response.dto';

/**
 * Product Controller
 * Handles HTTP requests for product management
 */
@ApiTags('products')
@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
  ) {}

  // -----------------------------
  // Crear producto
  // -----------------------------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created', type: ProductResponseDto })
  async createProduct(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    this.logger.log(`POST /products - Creating product: ${dto.name}`);

    const result = await this.createProductUseCase.execute(dto);

    return result.match(
      (product) => ProductResponseDto.fromEntity(product),
      (error) => {
        throw new Error(error.message);
      },
    );
  }

  // -----------------------------
  // Obtener todos los productos
  // -----------------------------
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Products retrieved', type: [ProductResponseDto] })
  async getAllProducts(): Promise<ProductResponseDto[]> {
    this.logger.log('GET /products - Retrieving all products');

    const result = await this.getAllProductsUseCase.execute();

    return result.match(
      (products) => products.map(ProductResponseDto.fromEntity),
      (error) => {
        throw new Error(error.message);
      },
    );
  }

  // -----------------------------
  // Obtener producto por ID
  // -----------------------------
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product unique identifier', example: 'uuid-1234' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product retrieved', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async getProductById(@Param('id') id: string): Promise<ProductResponseDto> {
    this.logger.log(`GET /products/${id} - Retrieving product`);

    const result = await this.getProductByIdUseCase.execute(id);

    return result.match(
      (product) => ProductResponseDto.fromEntity(product),
      (error) => {
        throw new Error(error.message);
      },
    );
  }

  // -----------------------------
  // Actualizar producto
  // -----------------------------
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product unique identifier', example: 'uuid-1234' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product updated', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    this.logger.log(`PATCH /products/${id} - Updating product`);

    const result = await this.updateProductUseCase.execute(id, dto);

    return result.match(
      (product) => ProductResponseDto.fromEntity(product),
      (error) => {
        throw new Error(error.message);
      },
    );
  }


}

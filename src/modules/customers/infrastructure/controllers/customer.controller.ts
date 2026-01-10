import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Logger,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case';
import { GetCustomerByIdUseCase } from '../../application/use-cases/get-customer-by-id.use-case';
import { GetCustomerByEmailUseCase } from '../../application/use-cases/get-customer-by-email.use-case';
import { GetAllCustomersUseCase } from '../../application/use-cases/get-all-customers.use-case';
import { UpdateCustomerUseCase } from '../../application/use-cases/update-customer.use-case';
import { DeleteCustomerUseCase } from '../../application/use-cases/delete-customer.use-case';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../../application/dtos/update-customer.dto';
import { CustomerResponseDto } from '../../application/dtos/customer-response.dto';

/**
 * Customer Controller
 * Handles HTTP requests for customer management
 */
@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name);

  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly getCustomerByEmailUseCase: GetCustomerByEmailUseCase,
    private readonly getAllCustomersUseCase: GetAllCustomersUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new customer',
    description: 'Creates a new customer with delivery information',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Customer created successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or customer already exists',
  })
  async createCustomer(
    @Body() dto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    this.logger.log(`POST /customers - Creating customer: ${dto.email}`);

    const result = await this.createCustomerUseCase.execute(dto);

    return result.match(
      (customer) => CustomerResponseDto.fromEntity(customer),
      (error) => {
        throw new Error(error.message);
      },
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all customers or find by email',
    description: 'Retrieves all customers or finds a specific customer by email',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filter by customer email',
    example: 'john.doe@example.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customers retrieved successfully',
    type: [CustomerResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found',
  })
  async getCustomers(
    @Query('email') email?: string,
  ): Promise<CustomerResponseDto | CustomerResponseDto[]> {
    if (email) {
      this.logger.log(`GET /customers?email=${email} - Finding customer by email`);
      const result = await this.getCustomerByEmailUseCase.execute(email);
      return result.match(
        (customer) => CustomerResponseDto.fromEntity(customer),
        (error) => {
          throw new Error(error.message);
        },
      );
    }

    this.logger.log('GET /customers - Retrieving all customers');
    const result = await this.getAllCustomersUseCase.execute();
    return result.match(
      (customers) => customers.map(CustomerResponseDto.fromEntity),
      (error) => {
        throw new Error(error.message);
      },
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Retrieves a customer by their unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer retrieved successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found',
  })
  async getCustomerById(@Param('id') id: string): Promise<CustomerResponseDto> {
    this.logger.log(`GET /customers/${id} - Retrieving customer`);

    const result = await this.getCustomerByIdUseCase.execute(id);

    return result.match(
      (customer) => CustomerResponseDto.fromEntity(customer),
      (error) => {
        throw new Error(error.message);
      },
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update customer',
    description: 'Updates an existing customer information',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer updated successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  async updateCustomer(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    this.logger.log(`PUT /customers/${id} - Updating customer`);

    const result = await this.updateCustomerUseCase.execute(id, dto);

    return result.match(
      (customer) => CustomerResponseDto.fromEntity(customer),
      (error) => {
        throw new Error(error.message);
      },
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete customer',
    description: 'Deletes a customer from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Customer deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found',
  })
  async deleteCustomer(@Param('id') id: string): Promise<void> {
    this.logger.log(`DELETE /customers/${id} - Deleting customer`);

    const result = await this.deleteCustomerUseCase.execute(id);

    result.match(
      () => undefined,
      (error) => {
        throw new Error(error.message);
      },
    );
  }
}

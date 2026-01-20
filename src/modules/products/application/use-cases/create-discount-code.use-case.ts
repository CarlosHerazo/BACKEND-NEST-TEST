import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DiscountCode, DISCOUNT_CODE_REPOSITORY } from '../../domain/entities/discount-code.entity';
import type { IDiscountCodeRepository } from '../../domain/ports/discount-code.repository.port';
import { Result } from '../../../../shared/domain/result';
import { CreateDiscountCodeDto } from '../dtos/create-discount-code.dto';

@Injectable()
export class CreateDiscountCodeUseCase {
  private readonly logger = new Logger(CreateDiscountCodeUseCase.name);

  constructor(
    @Inject(DISCOUNT_CODE_REPOSITORY)
    private readonly discountCodeRepository: IDiscountCodeRepository,
  ) {}

  async execute(dto: CreateDiscountCodeDto): Promise<Result<DiscountCode, Error>> {
    this.logger.log(`Creating discount code: ${dto.code}`);

    const existingResult = await this.discountCodeRepository.findByCode(dto.code);
    if (existingResult.isSuccess) {
      return Result.fail(new Error(`Discount code "${dto.code}" already exists`));
    }

    const discountCode = DiscountCode.create({
      id: uuidv4(),
      code: dto.code,
      discountPercentage: dto.discountPercentage,
    });

    return await this.discountCodeRepository.create(discountCode);
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { DISCOUNT_CODE_REPOSITORY, DiscountCode } from '../../domain/entities/discount-code.entity';
import type { IDiscountCodeRepository } from '../../domain/ports/discount-code.repository.port';
import { Result } from '../../../../shared/domain/result';

@Injectable()
export class GetAllDiscountCodesUseCase {
  private readonly logger = new Logger(GetAllDiscountCodesUseCase.name);

  constructor(
    @Inject(DISCOUNT_CODE_REPOSITORY)
    private readonly discountCodeRepository: IDiscountCodeRepository,
  ) {}

  async execute(): Promise<Result<DiscountCode[], Error>> {
    this.logger.log('Getting all discount codes');
    return await this.discountCodeRepository.findAll();
  }
}

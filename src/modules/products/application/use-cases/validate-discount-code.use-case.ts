import { Inject, Injectable, Logger } from '@nestjs/common';
import { DISCOUNT_CODE_REPOSITORY, DiscountCode } from '../../domain/entities/discount-code.entity';
import type { IDiscountCodeRepository } from '../../domain/ports/discount-code.repository.port';
import { Result } from '../../../../shared/domain/result';

export interface ValidateDiscountResult {
  valid: boolean;
  discountCode?: DiscountCode;
  message?: string;
}

@Injectable()
export class ValidateDiscountCodeUseCase {
  private readonly logger = new Logger(ValidateDiscountCodeUseCase.name);

  constructor(
    @Inject(DISCOUNT_CODE_REPOSITORY)
    private readonly discountCodeRepository: IDiscountCodeRepository,
  ) {}

  async execute(code: string): Promise<Result<ValidateDiscountResult, Error>> {
    this.logger.log(`Validating discount code: ${code}`);

    const result = await this.discountCodeRepository.findByCode(code);

    if (result.isFailure) {
      return Result.ok({
        valid: false,
        message: 'Discount code not found',
      });
    }

    const discountCode = result.getValue();

    return Result.ok({
      valid: true,
      discountCode,
      message: 'Discount code is valid',
    });
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { WompiTokensController } from './wompi-tokens.controller';
import { WompiIntegrationService } from '../../application/services/wompi-integration.service';

describe('WompiTokensController', () => {
  let controller: WompiTokensController;
  let wompiIntegrationService: jest.Mocked<WompiIntegrationService>;

  const mockMerchantData = {
    presigned_acceptance: {
      acceptance_token: 'acceptance-token-123',
      permalink: 'https://wompi.co/acceptance/link',
    },
    presigned_personal_data_auth: {
      acceptance_token: 'personal-auth-token-123',
      permalink: 'https://wompi.co/personal-auth/link',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WompiTokensController],
      providers: [
        {
          provide: WompiIntegrationService,
          useValue: { getMerchantData: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<WompiTokensController>(WompiTokensController);
    wompiIntegrationService = module.get(WompiIntegrationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAcceptanceTokens', () => {
    it('should return acceptance tokens successfully', async () => {
      wompiIntegrationService.getMerchantData.mockResolvedValue(mockMerchantData);

      const result = await controller.getAcceptanceTokens();

      expect(result).toEqual({
        acceptanceToken: 'acceptance-token-123',
        acceptPersonalAuth: 'personal-auth-token-123',
        permalinks: {
          acceptance: 'https://wompi.co/acceptance/link',
          personalAuth: 'https://wompi.co/personal-auth/link',
        },
      });
      expect(wompiIntegrationService.getMerchantData).toHaveBeenCalled();
    });

    it('should pass through errors from wompi service', async () => {
      wompiIntegrationService.getMerchantData.mockRejectedValue(
        new Error('Wompi service unavailable'),
      );

      await expect(controller.getAcceptanceTokens()).rejects.toThrow('Wompi service unavailable');
    });
  });
});

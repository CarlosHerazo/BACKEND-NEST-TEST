import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WompiIntegrationService } from '../../application/services/wompi-integration.service';

@ApiTags('wompi')
@Controller('wompi')
export class WompiTokensController {
  constructor(
    private readonly wompiIntegrationService: WompiIntegrationService,
  ) {}

  @Get('acceptance-tokens')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Wompi acceptance tokens',
    description:
      'Returns the acceptance tokens required for creating transactions. These tokens indicate user consent for data processing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Acceptance tokens retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        acceptanceToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        acceptPersonalAuth: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        permalinks: {
          type: 'object',
          properties: {
            acceptance: {
              type: 'string',
              example: 'https://wompi.co/acceptance/...',
            },
            personalAuth: {
              type: 'string',
              example: 'https://wompi.co/personal-auth/...',
            },
          },
        },
      },
    },
  })
  async getAcceptanceTokens(): Promise<{
    acceptanceToken: string;
    acceptPersonalAuth: string;
    permalinks: {
      acceptance: string;
      personalAuth: string;
    };
  }> {
    const merchantData = await this.wompiIntegrationService.getMerchantData();

    return {
      acceptanceToken: merchantData.presigned_acceptance.acceptance_token,
      acceptPersonalAuth:
        merchantData.presigned_personal_data_auth.acceptance_token,
      permalinks: {
        acceptance: merchantData.presigned_acceptance.permalink,
        personalAuth: merchantData.presigned_personal_data_auth.permalink,
      },
    };
  }
}

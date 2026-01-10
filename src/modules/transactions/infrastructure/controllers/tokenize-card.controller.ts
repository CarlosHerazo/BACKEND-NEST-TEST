import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { WompiApiClient } from '../clients/wompi-api.client';

class TokenizeCardDto {
  @ApiProperty({
    description: 'Card number',
    example: '4242424242424242',
  })
  @IsNotEmpty()
  @IsString()
  number: string;

  @ApiProperty({
    description: 'Card CVC',
    example: '123',
  })
  @IsNotEmpty()
  @IsString()
  cvc: string;

  @ApiProperty({
    description: 'Expiration month (MM)',
    example: '12',
  })
  @IsNotEmpty()
  @IsString()
  exp_month: string;

  @ApiProperty({
    description: 'Expiration year (YY)',
    example: '28',
  })
  @IsNotEmpty()
  @IsString()
  exp_year: string;

  @ApiProperty({
    description: 'Card holder name',
    example: 'Juan Perez',
  })
  @IsNotEmpty()
  @IsString()
  card_holder: string;
}

@ApiTags('wompi')
@Controller('wompi')
export class TokenizeCardController {
  constructor(private readonly wompiApiClient: WompiApiClient) {}

  @Post('tokenize-card')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tokenize a test card for sandbox',
    description: 'Converts card details into a secure token for testing in sandbox environment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Card tokenized successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'CREATED',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'tok_test_12345_XXXXXXXX',
            },
            created_at: {
              type: 'string',
              example: '2024-01-10T12:00:00.000Z',
            },
            brand: {
              type: 'string',
              example: 'VISA',
            },
            name: {
              type: 'string',
              example: 'Juan Perez',
            },
            last_four: {
              type: 'string',
              example: '4242',
            },
            bin: {
              type: 'string',
              example: '424242',
            },
            exp_year: {
              type: 'string',
              example: '28',
            },
            exp_month: {
              type: 'string',
              example: '12',
            },
            card_holder: {
              type: 'string',
              example: 'Juan Perez',
            },
            validity_ends_at: {
              type: 'string',
              example: '2024-02-10T12:00:00.000Z',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid card data',
  })
  async tokenizeCard(@Body() dto: TokenizeCardDto): Promise<any> {
    // This is a helper endpoint for testing
    // In production, tokenization should happen in the frontend using Wompi.js
    return this.wompiApiClient.tokenizeCard(dto);
  }
}

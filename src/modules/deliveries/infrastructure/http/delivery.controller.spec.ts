import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { CreateDeliveryDto } from '../../application/dtos/create-delivery.dto';

describe('DeliveryController', () => {
  let controller: DeliveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDelivery', () => {
    it('should throw BadRequestException (not yet implemented)', async () => {
      const dto: CreateDeliveryDto = {
        transactionId: 'transaction-123',
        customerName: 'John Doe',
        customerPhone: '+573001234567',
        address: {
          addressLine1: 'Calle 123',
          city: 'Bogotá',
          region: 'Cundinamarca',
          country: 'CO',
        },
      };

      await expect(controller.createDelivery(dto)).rejects.toThrow(BadRequestException);
      await expect(controller.createDelivery(dto)).rejects.toThrow(
        'Delivery creation not yet implemented',
      );
    });
  });

  describe('getDeliveryById', () => {
    it('should throw NotFoundException (not yet implemented)', async () => {
      await expect(controller.getDeliveryById('delivery-123')).rejects.toThrow(NotFoundException);
      await expect(controller.getDeliveryById('delivery-123')).rejects.toThrow(
        'Delivery retrieval not yet implemented',
      );
    });
  });

  describe('getDeliveryByTransactionId', () => {
    it('should throw NotFoundException (not yet implemented)', async () => {
      await expect(controller.getDeliveryByTransactionId('transaction-123')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getDeliveryByTransactionId('transaction-123')).rejects.toThrow(
        'Delivery retrieval by transaction not yet implemented',
      );
    });
  });
});

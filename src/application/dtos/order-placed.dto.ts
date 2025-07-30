import { Type } from 'class-transformer';
import { IsString, IsNumber, Min, MaxLength, IsArray, ValidateNested, IsObject, IsOptional } from 'class-validator';
import { OrderItemDto } from './order-item.dto';
import { ShippingAddressDto } from './shipping-adress.dto';

/**
 * @class OrderPlacedDto
 * @description DTO for order placed event
 * @example
 * {
 *  userId: '123',
 *  orderId: '456',
 *  amount: 100,
 *  currency: 'USD',
 *  items: [
 *    {
 *      id: '123',
 *      name: 'Product Name',
 *      quantity: 1,
 *      price: 100
 *    }
 *  ],
 *  shippingAddress: {
 *    street: '123 Main St',
 *    city: 'Anytown',
 *    state: 'CA',
 *    zipCode: '12345',
 *    country: 'USA'
 *  }
 * }
 */
export class OrderPlacedDto {
  @IsString()
  userId: string;

  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @MaxLength(10)
  currency: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

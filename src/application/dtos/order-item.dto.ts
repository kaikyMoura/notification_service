import { IsNumber, IsString, Min, MaxLength } from 'class-validator';

/**
 * @class OrderItemDto
 * @description DTO for order item
 * @example
 * {
 *  id: '123',
 *  name: 'Product Name',
 *  quantity: 1,
 *  price: 100
 * }
 */
export class OrderItemDto {
  @IsString()
  id: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

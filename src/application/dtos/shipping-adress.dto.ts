import { IsString, MaxLength } from 'class-validator';

/**
 * @class ShippingAddressDto
 * @description DTO for shipping address
 * @example
 * {
 *  street: '123 Main St',
 *  city: 'Anytown',
 *  state: 'CA',
 *  zipCode: '12345',
 *  country: 'USA'
 * }
 */
export class ShippingAddressDto {
  @IsString()
  @MaxLength(200)
  street: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  state: string;

  @IsString()
  @MaxLength(20)
  zipCode: string;

  @IsString()
  @MaxLength(100)
  country: string;
}

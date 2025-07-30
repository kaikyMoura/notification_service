import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

/**
 * @class VerificationCodeDto
 * @description DTO for verification code requests
 */
export class VerificationCodeDto {
  @IsPhoneNumber()
  @IsNotEmpty({ message: 'Phone number is required' })
  @ApiProperty({
    description: 'Phone number for verification code',
    example: '+1234567890',
    required: true,
  })
  phoneNumber: string;
}

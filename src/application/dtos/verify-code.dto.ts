import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

/**
 * @class VerifyCodeDto
 * @description DTO for code verification requests
 */
export class VerifyCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  @ApiProperty({
    description: 'Verification code',
    example: '123456',
    required: true,
  })
  code: string;

  @IsPhoneNumber()
  @IsNotEmpty({ message: 'Phone number is required' })
  @ApiProperty({
    description: 'Phone number associated with the code',
    example: '+1234567890',
    required: true,
  })
  phoneNumber: string;
}

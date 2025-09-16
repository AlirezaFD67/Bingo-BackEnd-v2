import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const trimString = ({ value }: { value: unknown }): string | undefined => {
  return typeof value === 'string'
    ? value.trim()
    : (value as string | undefined);
};

const normalizeBankCardNumber = ({
  value,
}: {
  value: unknown;
}): string | undefined => {
  if (typeof value === 'string') {
    // Remove spaces and trim
    return value.replace(/\s+/g, '').trim();
  }
  return value as string | undefined;
};

interface ValidationObject {
  username?: string;
  firstName?: string;
  lastName?: string;
  bankCardNumber?: string;
  shebaNumber?: string;
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'نام کاربری جدید',
    example: 'new_username',
    required: false,
  })
  @IsOptional()
  @ValidateIf(
    (obj: ValidationObject) =>
      obj.username !== undefined && obj.username !== '',
  )
  @IsString()
  @IsNotEmpty({ message: 'نام کاربری نمی‌تواند خالی باشد' })
  @MinLength(3, { message: 'نام کاربری باید حداقل ۳ کاراکتر باشد' })
  @MaxLength(50, { message: 'نام کاربری نمی‌تواند بیش از ۵۰ کاراکتر باشد' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و زیرخط باشد',
  })
  @Transform(trimString)
  username?: string;

  @ApiPropertyOptional({
    description: 'نام جدید',
    example: 'علی',
    required: false,
  })
  @IsOptional()
  @ValidateIf(
    (obj: ValidationObject) =>
      obj.firstName !== undefined && obj.firstName !== '',
  )
  @IsString()
  @IsNotEmpty({ message: 'نام نمی‌تواند خالی باشد' })
  @MaxLength(50, { message: 'نام نمی‌تواند بیش از ۵۰ کاراکتر باشد' })
  @Transform(trimString)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'نام خانوادگی جدید',
    example: 'احمدی',
    required: false,
  })
  @IsOptional()
  @ValidateIf(
    (obj: ValidationObject) =>
      obj.lastName !== undefined && obj.lastName !== '',
  )
  @IsString()
  @IsNotEmpty({ message: 'نام خانوادگی نمی‌تواند خالی باشد' })
  @MaxLength(50, { message: 'نام خانوادگی نمی‌تواند بیش از ۵۰ کاراکتر باشد' })
  @Transform(trimString)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'شماره کارت بانکی جدید',
    example: '1111222233334444',
    required: false,
  })
  @IsOptional()
  @ValidateIf(
    (obj: ValidationObject) =>
      obj.bankCardNumber !== undefined && obj.bankCardNumber !== '',
  )
  @IsString()
  @IsNotEmpty({ message: 'شماره کارت بانکی نمی‌تواند خالی باشد' })
  @Matches(/^\d{16}$|^\d{4} \d{4} \d{4} \d{4}$/, {
    message:
      'فرمت شماره کارت بانکی صحیح نیست (۱۶ رقم یا ۴ گروه ۴ رقمی با فاصله)',
  })
  @Transform(normalizeBankCardNumber)
  bankCardNumber?: string;

  @ApiPropertyOptional({
    description: 'شماره شبا جدید',
    example: 'IR123456789012345678901234',
    required: false,
  })
  @IsOptional()
  @ValidateIf(
    (obj: ValidationObject) =>
      obj.shebaNumber !== undefined && obj.shebaNumber !== '',
  )
  @IsString()
  @IsNotEmpty({ message: 'شماره شبا نمی‌تواند خالی باشد' })
  @Matches(/^IR\d{24}$/, {
    message:
      'فرمت شماره شبا صحیح نیست (باید با IR شروع شود و ۲۴ رقم داشته باشد)',
  })
  @Transform(trimString)
  shebaNumber?: string;
}

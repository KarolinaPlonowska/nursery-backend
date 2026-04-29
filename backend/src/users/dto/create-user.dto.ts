// src/users/dto/create-user.dto.ts
import { IsOptional, IsString, IsBoolean } from 'class-validator';
export class CreateUserDto {
  username: string;
  password: string;
  email: string;
  role: 'ADMIN' | 'PARENT' | 'CAREGIVER';

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsString()
  groupId?: string;
}

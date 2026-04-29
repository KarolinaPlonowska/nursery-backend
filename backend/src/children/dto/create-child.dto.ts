import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateChildDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString() // sprawdza, czy jest to poprawny format daty
  birthDate: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;
}

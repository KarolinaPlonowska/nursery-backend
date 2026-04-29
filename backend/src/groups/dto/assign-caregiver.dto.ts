import { IsString, IsNotEmpty } from 'class-validator';

export class AssignCaregiverDto {
  @IsString()
  @IsNotEmpty()
  caregiverId: string;
}

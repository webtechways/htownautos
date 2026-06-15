import { IsString, MaxLength, MinLength } from 'class-validator';

/** Body for POST /api/v1/portal/inspections/:id/requests */
export class AddInspectionRequestDto {
  @IsString()
  @MinLength(1, { message: 'El texto de la solicitud no puede estar vacío' })
  @MaxLength(500, { message: 'El texto de la solicitud no puede exceder 500 caracteres' })
  text!: string;
}

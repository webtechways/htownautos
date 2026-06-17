import { PartialType } from '@nestjs/mapped-types';
import { CreateInspectionErrorCodeDto } from './create-inspection-error-code.dto';

export class UpdateInspectionErrorCodeDto extends PartialType(
  CreateInspectionErrorCodeDto,
) {}

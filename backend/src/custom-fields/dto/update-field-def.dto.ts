import { PartialType } from '@nestjs/swagger';
import { CreateFieldDefDto } from './create-field-def.dto';

export class UpdateFieldDefDto extends PartialType(CreateFieldDefDto) {}

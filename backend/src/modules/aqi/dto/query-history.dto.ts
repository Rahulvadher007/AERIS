import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OffsetPaginationDto } from '../../../common/dto/pagination.dto';

export class QueryHistoryDto extends OffsetPaginationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  stationId?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;
}

import { IsString, IsOptional, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryHistoryDto {
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

  @ApiProperty({ default: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ default: 50, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @IsOptional()
  limit?: number = 50;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;
}

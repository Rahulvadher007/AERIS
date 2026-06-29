import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAqiDto {
  @ApiProperty({ example: 'station-uuid' })
  @IsString()
  @IsNotEmpty()
  stationId: string;

  @ApiProperty({ example: '2023-10-25T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({ example: 145 })
  @IsNumber()
  @IsNotEmpty()
  aqi: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  pm25?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  pm10?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  no2?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  so2?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  co?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  o3?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  nh3?: number;
}

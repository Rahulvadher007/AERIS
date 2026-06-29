import { IsString, IsNotEmpty, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeatherDto {
  @ApiProperty({ example: 'station-uuid' })
  @IsString()
  @IsNotEmpty()
  stationId: string;

  @ApiProperty({ example: '2023-10-25T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({ example: 35.5 })
  @IsNumber()
  @Min(-50)
  @Max(60)
  temperature: number;

  @ApiProperty({ example: 65 })
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @ApiProperty({ example: 12.5 })
  @IsNumber()
  @Min(0)
  windSpeed: number;

  @ApiProperty({ example: 180 })
  @IsNumber()
  @Min(0)
  @Max(360)
  windDirection: number;

  @ApiProperty({ example: 1012 })
  @IsNumber()
  @Min(800)
  @Max(1200)
  pressure: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  rainfall: number;
}

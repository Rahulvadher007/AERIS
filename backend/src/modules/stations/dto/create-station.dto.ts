import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStationDto {
  @ApiProperty({ example: 'AMD001' })
  @IsString()
  @IsNotEmpty()
  stationCode: string;

  @ApiProperty({ example: 'Maninagar' })
  @IsString()
  @IsNotEmpty()
  stationName: string;

  @ApiProperty({ example: 'Ahmedabad' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Gujarat' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 22.9935 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 72.6025 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

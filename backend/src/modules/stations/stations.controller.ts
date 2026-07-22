import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { OffsetPaginationDto } from '../../common/dto/pagination.dto';
import { QueryStationsDto } from './dto/query-stations.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Stations')
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new station' })
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationsService.create(createStationDto);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get all unique cities' })
  findCities() {
    return this.stationsService.findUniqueCities();
  }

  @Get()
  @ApiOperation({ summary: 'Get all stations' })
  findAll(
    @Query() query: QueryStationsDto,
    @Query() pagination?: OffsetPaginationDto,
  ) {
    return this.stationsService.findAll(
      query.city,
      pagination?.page,
      pagination?.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a station by ID' })
  findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a station' })
  update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto) {
    return this.stationsService.update(id, updateStationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a station' })
  remove(@Param('id') id: string) {
    return this.stationsService.remove(id);
  }
}

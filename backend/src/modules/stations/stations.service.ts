import { Injectable, NotFoundException } from '@nestjs/common';
import { StationsRepository } from './stations.repository';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsService {
  constructor(private readonly repository: StationsRepository) {}

  async create(createStationDto: CreateStationDto) {
    return this.repository.create(createStationDto);
  }

  async findAll(city?: string) {
    return this.repository.findAll(city);
  }

  async findUniqueCities() {
    return this.repository.findUniqueCities();
  }

  async findOne(id: string) {
    const station = await this.repository.findById(id);
    if (!station) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }
    return station;
  }

  async update(id: string, updateStationDto: UpdateStationDto) {
    await this.findOne(id); // Ensures it exists
    return this.repository.update(id, updateStationDto);
  }

  async remove(id: string) {
    await this.findOne(id); // Ensures it exists
    return this.repository.delete(id);
  }
}

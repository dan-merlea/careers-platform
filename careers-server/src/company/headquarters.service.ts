import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Headquarters,
  HeadquartersDocument,
} from './schemas/headquarters.schema';
import { CreateHeadquartersDto } from './dto/create-headquarters.dto';
import { UpdateHeadquartersDto } from './dto/update-headquarters.dto';

@Injectable()
export class HeadquartersService {
  constructor(
    @InjectModel(Headquarters.name) private headquartersModel: Model<HeadquartersDocument>,
  ) {}

  async create(createHeadquartersDto: CreateHeadquartersDto): Promise<Headquarters> {
    const createdHeadquarters = new this.headquartersModel(createHeadquartersDto);
    return createdHeadquarters.save();
  }

  async findAll(): Promise<Headquarters[]> {
    return this.headquartersModel.find().exec();
  }

  async findOne(id: string): Promise<Headquarters> {
    const headquarters = await this.headquartersModel.findById(id).exec();
    if (!headquarters) {
      throw new NotFoundException(`Headquarters with ID ${id} not found`);
    }
    return headquarters;
  }

  async update(id: string, updateHeadquartersDto: UpdateHeadquartersDto): Promise<Headquarters> {
    const updatedHeadquarters = await this.headquartersModel
      .findByIdAndUpdate(id, updateHeadquartersDto, { new: true })
      .exec();

    if (!updatedHeadquarters) {
      throw new NotFoundException(`Headquarters with ID ${id} not found`);
    }

    return updatedHeadquarters;
  }

  async remove(id: string): Promise<void> {
    const result = await this.headquartersModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Headquarters with ID ${id} not found`);
    }
  }

  async getMainHeadquarters(): Promise<Headquarters | null> {
    // Since we no longer have isMainHeadquarters field, return the first headquarters
    // or implement another way to determine the main headquarters
    return this.headquartersModel.findOne().exec();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Office, OfficeDocument } from './schemas/office.schema';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';

@Injectable()
export class OfficesService {
  constructor(
    @InjectModel(Office.name) private officeModel: Model<OfficeDocument>,
  ) {}

  async create(
    createOfficeDto: CreateOfficeDto,
    companyId: string,
  ): Promise<Office> {
    const officeData = {
      ...createOfficeDto,
      companyId,
    };
    const createdOffice = new this.officeModel(officeData);
    return createdOffice.save();
  }

  async findAll(companyId?: string): Promise<Office[]> {
    const query = companyId ? { companyId } : {};
    return this.officeModel.find(query).exec();
  }

  async findOne(id: string): Promise<Office> {
    const office = await this.officeModel.findById(id).exec();
    if (!office) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }
    return office;
  }

  async update(id: string, updateOfficeDto: UpdateOfficeDto): Promise<Office> {
    const updatedOffice = await this.officeModel
      .findByIdAndUpdate(id, updateOfficeDto, { new: true })
      .exec();

    if (!updatedOffice) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }

    return updatedOffice;
  }

  async remove(id: string): Promise<void> {
    const result = await this.officeModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }
  }

  async getMainOffice(companyId: string): Promise<Office | null> {
    return this.officeModel.findOne({ companyId }).exec();
  }
}

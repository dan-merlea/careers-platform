import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiKey, ApiKeyDocument, IntegrationType } from './api-keys.schema';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
  ) {}

  async create(
    userId: string,
    createApiKeyDto: CreateApiKeyDto,
  ): Promise<ApiKey> {
    // Check if an API key for this integration type already exists for this user
    const existingKey = await this.apiKeyModel.findOne({
      userId: new Types.ObjectId(userId),
      type: createApiKeyDto.type,
    });

    // If exists, update it instead of creating a new one
    if (existingKey) {
      return this.update(
        userId,
        existingKey._id?.toString() || '',
        createApiKeyDto,
      );
    }

    // Create a new API key
    const createdApiKey = new this.apiKeyModel({
      userId: new Types.ObjectId(userId),
      ...createApiKeyDto,
    });

    return createdApiKey.save();
  }

  async findAllForUser(userId: string): Promise<ApiKey[]> {
    return this.apiKeyModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async findOneByType(userId: string, type: IntegrationType): Promise<ApiKey> {
    const apiKey = await this.apiKeyModel.findOne({
      userId: new Types.ObjectId(userId),
      type,
    });

    if (!apiKey) {
      throw new NotFoundException(`API key for ${type} not found`);
    }

    return apiKey;
  }

  async update(
    userId: string,
    id: string,
    updateApiKeyDto: CreateApiKeyDto,
  ): Promise<ApiKey> {
    const apiKey = await this.apiKeyModel.findById(id);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    // Ensure the API key belongs to the user
    if (apiKey.userId.toString() !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to update this API key',
      );
    }

    // Update the API key
    Object.assign(apiKey, updateApiKeyDto);
    return apiKey.save();
  }

  async remove(userId: string, id: string): Promise<void> {
    const apiKey = await this.apiKeyModel.findById(id);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    // Ensure the API key belongs to the user
    if (apiKey.userId.toString() !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to delete this API key',
      );
    }

    await this.apiKeyModel.findByIdAndDelete(id);
  }
}

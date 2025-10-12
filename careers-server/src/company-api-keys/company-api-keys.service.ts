import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanyApiKey, CompanyApiKeyDocument } from './schemas/company-api-key.schema';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompanyApiKeysService {
  constructor(
    @InjectModel(CompanyApiKey.name)
    private companyApiKeyModel: Model<CompanyApiKeyDocument>,
  ) {}

  async generateApiKey(
    companyId: string,
    userId: string,
    name: string,
    description?: string,
  ): Promise<{ apiKey: CompanyApiKey; secretKey: string }> {
    // Generate API key (public identifier)
    const apiKey = `ck_${crypto.randomBytes(16).toString('hex')}`;
    
    // Generate secret key (private, shown only once)
    const secretKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
    
    // Hash the secret key before storing
    const hashedSecretKey = await bcrypt.hash(secretKey, 10);

    const newApiKey = new this.companyApiKeyModel({
      companyId,
      apiKey,
      secretKey: hashedSecretKey,
      name,
      description,
      createdBy: userId,
      isActive: true,
    });

    const saved = await newApiKey.save();

    // Return the API key document and the plain secret key (only time it's visible)
    return {
      apiKey: saved,
      secretKey, // Plain text, only returned once
    };
  }

  async findAll(companyId: string): Promise<CompanyApiKey[]> {
    return this.companyApiKeyModel
      .find({ companyId })
      .select('-secretKey') // Never return the hashed secret
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, companyId: string): Promise<CompanyApiKey> {
    const apiKey = await this.companyApiKeyModel
      .findOne({ _id: id, companyId })
      .select('-secretKey')
      .exec();

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  async delete(id: string, companyId: string): Promise<void> {
    const result = await this.companyApiKeyModel
      .deleteOne({ _id: id, companyId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('API key not found');
    }
  }

  async toggleActive(id: string, companyId: string): Promise<CompanyApiKey> {
    const apiKey = await this.companyApiKeyModel
      .findOne({ _id: id, companyId })
      .exec();

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();

    // Return without secret key
    return this.findOne(id, companyId);
  }

  async verifyApiKey(apiKey: string, secretKey: string): Promise<CompanyApiKeyDocument | null> {
    const key = await this.companyApiKeyModel
      .findOne({ apiKey, isActive: true })
      .exec();

    if (!key) {
      return null;
    }

    const isValid = await bcrypt.compare(secretKey, key.secretKey);
    if (!isValid) {
      return null;
    }

    // Update last used timestamp
    key.lastUsedAt = new Date();
    await key.save();

    return key;
  }

  // Mask secret key for display (show first 8 and last 4 characters)
  maskSecretKey(secretKey: string): string {
    if (!secretKey || secretKey.length < 12) {
      return '••••••••••••';
    }
    const start = secretKey.substring(0, 8);
    const end = secretKey.substring(secretKey.length - 4);
    return `${start}••••••••${end}`;
  }
}

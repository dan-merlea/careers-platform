import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobTemplate, JobTemplateDocument } from './schemas/job-template.schema';
import { CreateJobTemplateDto, UpdateJobTemplateDto, JobTemplateResponseDto } from './dto/job-template.dto';
import { sanitizeHtmlContent } from '../utils/html-sanitizer';

@Injectable()
export class JobTemplateService {
  constructor(
    @InjectModel(JobTemplate.name) private jobTemplateModel: Model<JobTemplateDocument>,
  ) {}

  async create(createJobTemplateDto: CreateJobTemplateDto): Promise<JobTemplateDocument> {
    const templateData = { ...createJobTemplateDto };
    
    // Sanitize HTML content
    templateData.content = sanitizeHtmlContent(templateData.content);
    
    // Convert department ID to ObjectId if provided
    if (templateData.departmentId) {
      const department = new Types.ObjectId(templateData.departmentId);
      delete templateData.departmentId;
      
      const newTemplate = new this.jobTemplateModel({
        ...templateData,
        department,
      });
      
      return newTemplate.save();
    }
    
    const newTemplate = new this.jobTemplateModel(templateData);
    return newTemplate.save();
  }

  async findAll(): Promise<JobTemplateDocument[]> {
    return this.jobTemplateModel.find().populate('department').exec();
  }

  async findByRole(role: string): Promise<JobTemplateDocument[]> {
    // Role is expected to be an ID
    return this.jobTemplateModel.find({ role }).populate('department').exec();
  }

  async findOne(id: string): Promise<JobTemplateDocument> {
    const template = await this.jobTemplateModel.findById(id).populate('department').exec();
    
    if (!template) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
    
    return template;
  }

  async update(id: string, updateJobTemplateDto: UpdateJobTemplateDto): Promise<JobTemplateDocument> {
    const templateData = { ...updateJobTemplateDto };
    
    // Sanitize HTML content if provided
    if (templateData.content) {
      templateData.content = sanitizeHtmlContent(templateData.content);
    }
    
    // Convert department ID to ObjectId if provided
    if (templateData.departmentId) {
      const department = new Types.ObjectId(templateData.departmentId);
      delete templateData.departmentId;
      templateData['department'] = department;
    }
    
    const updatedTemplate = await this.jobTemplateModel
      .findByIdAndUpdate(id, templateData, { new: true })
      .populate('department')
      .exec();
      
    if (!updatedTemplate) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
    
    return updatedTemplate;
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobTemplateModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
  }

  toResponseDto(template: JobTemplateDocument): JobTemplateResponseDto {
    const response: JobTemplateResponseDto = {
      id: template._id instanceof Types.ObjectId ? template._id.toString() : String(template._id),
      name: template.name,
      content: template.content,
      role: template.role,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };

    if (template.department) {
      // Check if department is populated
      const department = template.populated('department');
      if (department) {
        // Type assertion for department
        const typedDepartment = department as { _id: Types.ObjectId; name: string };
        response.department = {
          id: typedDepartment._id.toString(),
          name: typedDepartment.name,
        };
      }
    }

    return response;
  }
}

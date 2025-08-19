import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Check for circular reference if parent department is specified
    if (createDepartmentDto.parentDepartment) {
      await this.validateParentDepartment(createDepartmentDto.parentDepartment);
    }
    
    const createdDepartment = new this.departmentModel(createDepartmentDto);
    return createdDepartment.save();
  }

  async findAll(): Promise<Department[]> {
    return this.departmentModel.find().populate('parentDepartment').exec();
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentModel
      .findById(id)
      .populate('parentDepartment')
      .exec();
      
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    
    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    // Check for circular reference if parent department is being updated
    if (updateDepartmentDto.parentDepartment) {
      // Prevent setting itself as parent
      if (updateDepartmentDto.parentDepartment === id) {
        throw new BadRequestException('Department cannot be its own parent');
      }
      
      // Check if the new parent would create a circular reference
      await this.validateParentDepartment(updateDepartmentDto.parentDepartment, id);
    }
    
    const updatedDepartment = await this.departmentModel
      .findByIdAndUpdate(id, updateDepartmentDto, { new: true })
      .populate('parentDepartment')
      .exec();

    if (!updatedDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return updatedDepartment;
  }

  async remove(id: string): Promise<void> {
    // Check if department has children
    const hasChildren = await this.departmentModel.exists({ parentDepartment: id });
    
    if (hasChildren) {
      throw new BadRequestException(
        'Cannot delete department with sub-departments. Please reassign or delete sub-departments first.'
      );
    }
    
    const result = await this.departmentModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  async getHierarchy(): Promise<Department[]> {
    // Get all top-level departments (those without a parent)
    const topLevelDepartments = await this.departmentModel
      .find({ parentDepartment: null })
      .exec();
    
    // For each top-level department, recursively get its children
    const result: Department[] = [];
    
    for (const dept of topLevelDepartments) {
      if (dept._id) {
        const populatedDept = await this.populateSubDepartments(dept._id.toString());
        result.push(populatedDept);
      }
    }
    
    return result;
  }
  
  private async populateSubDepartments(departmentId: string): Promise<Department> {
    const department = await this.departmentModel.findById(departmentId).exec();
    
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }
    
    // Find all direct children
    const children = await this.departmentModel
      .find({ parentDepartment: departmentId })
      .exec();
      
    // Recursively populate each child's sub-departments
    const populatedChildren: Department[] = [];
    
    for (const child of children) {
      if (child._id) {
        const populatedChild = await this.populateSubDepartments(
          child._id.toString(),
        );
        populatedChildren.push(populatedChild);
      }
    }
    
    // Convert to plain object to add the subDepartments field
    const result = department.toObject();
    result.subDepartments = populatedChildren;
    
    return result as Department;
  }
  
  private async validateParentDepartment(parentId: string, currentId?: string): Promise<void> {
    // Check if parent department exists
    const parentExists = await this.departmentModel.exists({ _id: parentId });
    
    if (!parentExists) {
      throw new NotFoundException(`Parent department with ID ${parentId} not found`);
    }
    
    // If we're updating an existing department, check for circular references
    if (currentId) {
      // Check if the new parent is a descendant of the current department
      const isDescendant = await this.isDescendant(currentId, parentId);
      
      if (isDescendant) {
        throw new BadRequestException(
          'Circular reference detected. A department cannot have one of its descendants as its parent.'
        );
      }
    }
  }
  
  private async isDescendant(ancestorId: string, potentialDescendantId: string): Promise<boolean> {
    // Base case: they are the same
    if (ancestorId === potentialDescendantId) {
      return true;
    }
    
    // Get all direct children of the ancestor
    const children = await this.departmentModel
      .find({ parentDepartment: ancestorId })
      .exec();
      
    // Recursively check if any child is or contains the potential descendant
    for (const child of children) {
      if (
        child._id && 
        (await this.isDescendant(child._id.toString(), potentialDescendantId))
      ) {
        return true;
      }
    }
    
    return false;
  }
}


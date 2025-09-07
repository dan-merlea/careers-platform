import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

    const newDepartment = new this.departmentModel(createDepartmentDto);
    const savedDepartment = await newDepartment.save();

    // If this department has a parent, update the parent's subDepartments array
    if (createDepartmentDto.parentDepartment && savedDepartment._id) {
      try {
        const idString = savedDepartment._id instanceof Types.ObjectId
          ? String(savedDepartment._id)
          : String(savedDepartment._id);

        await this.updateParentSubDepartments(
          createDepartmentDto.parentDepartment,
          idString,
        );
      } catch (error) {
        console.error('Error updating parent department:', error);
      }
    }

    return savedDepartment;
  }

  async findAll(companyId?: string): Promise<Department[]> {
    const query = companyId ? { companyId } : {};
    return this.departmentModel.find(query).populate('parentDepartment').exec();
  }

  async findOne(id: string, companyId?: string): Promise<Department> {
    const query = { _id: id };
    if (companyId) {
      query['companyId'] = companyId;
    }
    const department = await this.departmentModel
      .findOne(query)
      .populate('parentDepartment')
      .exec();

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    // Get the current department to check if parent is changing
    const currentDepartment = await this.departmentModel.findById(id).exec();
    if (!currentDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Get old parent ID as string
    let oldParentId: string | null = null;
    if (currentDepartment.parentDepartment) {
      oldParentId = String(currentDepartment.parentDepartment);
    }

    const newParentId = updateDepartmentDto.parentDepartment || null;

    // Check for circular reference if parent department is being updated
    if (updateDepartmentDto.parentDepartment) {
      // Prevent setting itself as parent
      if (updateDepartmentDto.parentDepartment === id) {
        throw new BadRequestException('Department cannot be its own parent');
      }

      // Check if the new parent would create a circular reference
      await this.validateParentDepartment(
        updateDepartmentDto.parentDepartment,
        id,
      );
    }

    const updatedDepartment = await this.departmentModel
      .findByIdAndUpdate(id, updateDepartmentDto, { new: true })
      .populate('parentDepartment')
      .exec();

    if (!updatedDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // If parent has changed, update both old and new parent's subDepartments arrays
    if (oldParentId !== newParentId) {
      // Remove from old parent's subDepartments if it had one
      if (oldParentId) {
        await this.removeFromParentSubDepartments(oldParentId, id);
      }

      // Add to new parent's subDepartments if it has one
      if (newParentId) {
        await this.updateParentSubDepartments(newParentId, id);
      }
    }

    return updatedDepartment;
  }

  async remove(id: string): Promise<void> {
    // Check if department has children
    const hasChildren = await this.departmentModel.exists({
      parentDepartment: id,
    });

    if (hasChildren) {
      throw new BadRequestException(
        'Cannot delete department with sub-departments. Please reassign or delete sub-departments first.',
      );
    }

    // Get the department to check if it has a parent
    const department = await this.departmentModel.findById(id).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // If it has a parent, remove it from the parent's subDepartments array
    if (department.parentDepartment) {
      const parentId = String(department.parentDepartment);

      await this.removeFromParentSubDepartments(parentId, id);
    }

    const result = await this.departmentModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  async getHierarchy(companyId?: string): Promise<Department[]> {
    // Get all top-level departments (those without a parent)
    const query = { parentDepartment: null };
    if (companyId) {
      query['companyId'] = companyId;
    }
    const topLevelDepartments = await this.departmentModel.find(query).exec();

    // For each top-level department, recursively get its children
    const result: Department[] = [];

    for (const dept of topLevelDepartments) {
      if (dept._id) {
        const idString = String(dept._id);

        const populatedDept = await this.populateSubDepartments(idString);
        result.push(populatedDept);
      }
    }

    return result;
  }

  private async populateSubDepartments(
    departmentId: string,
  ): Promise<Department> {
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
        const idString = String(child._id);

        const populatedChild = await this.populateSubDepartments(idString);
        populatedChildren.push(populatedChild);
      }
    }

    // Convert to plain object to add the subDepartments field
    const result = department.toObject();
    result.subDepartments = populatedChildren;

    return result as Department;
  }

  /**
   * Validates that a parent department exists and doesn't create a circular reference
   */
  private async validateParentDepartment(
    parentId: string,
    childId?: string,
  ): Promise<void> {
    // Check if parent exists
    const parent = await this.departmentModel.findById(parentId).exec();
    if (!parent) {
      throw new NotFoundException(
        `Parent department with ID ${parentId} not found`,
      );
    }

    // If childId is provided, check for circular reference
    if (childId) {
      // Check if the new parent is a descendant of the current department
      // This would create a circular reference
      const isDescendant = await this.isDescendant(childId, parentId);
      if (isDescendant) {
        throw new BadRequestException(
          'Cannot set a department as parent that is a descendant of the current department',
        );
      }
    }
  }

  /**
   * Checks if potentialDescendantId is a descendant of ancestorId
   */
  private async isDescendant(
    ancestorId: string,
    potentialDescendantId: string,
  ): Promise<boolean> {
    // Direct child check
    const directChild = await this.departmentModel.findOne({
      _id: potentialDescendantId,
      parentDepartment: ancestorId,
    })
      .exec();

    if (directChild) {
      return true;
    }

    // Check descendants recursively
    const children = await this.departmentModel
      .find({ parentDepartment: ancestorId })
      .exec();

    for (const child of children) {
      if (child._id) {
        const childId = String(child._id);

        const isChildDescendant = await this.isDescendant(
          childId,
          potentialDescendantId,
        );
        if (isChildDescendant) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Updates a parent department's subDepartments array to include a child department
   */
  private async updateParentSubDepartments(
    parentId: string,
    childId: string,
  ): Promise<void> {
    const parent = await this.departmentModel.findById(parentId).exec();

    if (!parent) {
      throw new NotFoundException(
        `Parent department with ID ${parentId} not found`,
      );
    }

    // Add child to subDepartments if not already there
    if (!parent.subDepartments) {
      parent.subDepartments = [];
    }

    // Convert to string IDs for comparison
    const subDeptIds = parent.subDepartments.map((id) => String(id));

    if (!subDeptIds.includes(childId)) {
      // Convert string ID to ObjectId before pushing
      try {
        // Add the child ID to the subDepartments array
        // The schema expects an array of ObjectIds
        // @ts-expect-error - This is actually correct for Mongoose, but TypeScript doesn't understand the schema typing
        parent.subDepartments.push(new Types.ObjectId(childId));
        await parent.save();
      } catch (error) {
        console.error('Error converting childId to ObjectId:', error);
      }
    }
  }

  /**
   * Removes a child department from a parent department's subDepartments array
   */
  private async removeFromParentSubDepartments(
    parentId: string,
    childId: string,
  ): Promise<void> {
    const parent = await this.departmentModel.findById(parentId).exec();

    if (!parent) {
      throw new NotFoundException(
        `Parent department with ID ${parentId} not found`,
      );
    }

    if (parent.subDepartments && parent.subDepartments.length > 0) {
      // Filter out the child ID
      parent.subDepartments = parent.subDepartments.filter((id) => {
        return String(id) !== childId;
      });

      await parent.save();
    }
  }
}

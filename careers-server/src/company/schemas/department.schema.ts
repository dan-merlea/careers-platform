import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserRole } from '../../users/schemas/user.schema';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Department',
    default: null,
  })
  parentDepartment: Department | null;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Department' }])
  subDepartments: Department[];

  @Prop({ type: String, enum: UserRole, default: UserRole.DIRECTOR })
  approvalRole: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'JobRole' }])
  jobRoles: string[];
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

// Add virtual property to populate sub-departments
DepartmentSchema.virtual('childDepartments', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'parentDepartment',
});

// Ensure virtuals are included in JSON output
DepartmentSchema.set('toJSON', { virtuals: true });
DepartmentSchema.set('toObject', { virtuals: true });

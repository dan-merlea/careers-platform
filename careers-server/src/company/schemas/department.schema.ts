import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  headCount: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Department',
    default: null,
  })
  parentDepartment: Department | null;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Department' }])
  subDepartments: Department[];
  
  @Prop()
  manager: string;
  
  @Prop({ default: true })
  isActive: boolean;
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

import { ObjectId } from 'mongoose';

export interface JobFunction {
  _id?: ObjectId;
  title: string;
  companyId: ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

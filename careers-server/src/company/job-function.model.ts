import { ObjectId } from 'mongoose';

export interface JobFunction {
  _id?: ObjectId;
  title: string;
  company: ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

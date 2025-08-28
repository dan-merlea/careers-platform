import { ObjectId } from 'mongoose';

export interface JobRole {
  _id?: ObjectId;
  title: string;
  jobFunction: ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

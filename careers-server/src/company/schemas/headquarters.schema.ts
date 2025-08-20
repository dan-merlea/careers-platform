import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HeadquartersDocument = Headquarters & Document;

@Schema({ timestamps: true })
export class Headquarters {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;
}

export const HeadquartersSchema = SchemaFactory.createForClass(Headquarters);

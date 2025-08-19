import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HeadquartersDocument = Headquarters & Document;

@Schema({ timestamps: true })
export class Headquarters {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  country: string;

  @Prop()
  postalCode: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ default: false })
  isMainHeadquarters: boolean;

  @Prop()
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const HeadquartersSchema = SchemaFactory.createForClass(Headquarters);

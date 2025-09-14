import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CalendarIntegrationType } from '../dto/calendar-credentials.dto';

export type CalendarCredentialsDocument = CalendarCredentials & Document;

@Schema({ timestamps: true })
export class CalendarCredentials {
  @Prop({
    required: true,
    enum: Object.values(CalendarIntegrationType),
    unique: true,
  })
  type: CalendarIntegrationType;

  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  clientSecret: string;

  @Prop()
  redirectUri?: string;

  @Prop()
  refreshToken?: string;

  @Prop()
  tenantId?: string;
}

export const CalendarCredentialsSchema = SchemaFactory.createForClass(CalendarCredentials);

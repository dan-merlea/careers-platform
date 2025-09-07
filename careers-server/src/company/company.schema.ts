import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class SocialLinks {
  @Prop()
  linkedin: string;

  @Prop()
  twitter: string;

  @Prop()
  facebook: string;

  @Prop()
  instagram: string;
}

@Schema()
class CompanyValue {
  @Prop({ required: true })
  text: string;

  @Prop()
  icon: string;
}

@Schema()
export class CompanySettings {
  @Prop({ default: 'headcount' })
  approvalType: 'headcount' | 'job-opening';
}

@Schema({ timestamps: true })
export class Company extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  logo: string;

  @Prop()
  website: string;

  @Prop()
  description: string;

  @Prop()
  industry: string;

  @Prop()
  foundedYear: string;

  @Prop()
  size: string;

  @Prop({ type: SocialLinks, default: {} })
  socialLinks: SocialLinks;

  @Prop()
  mission: string;

  @Prop()
  vision: string;

  @Prop([{ type: Object }])
  values: CompanyValue[];

  @Prop({ type: CompanySettings, default: { approvalType: 'headcount' } })
  settings: CompanySettings;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { USER_MODEL } from '../../users/constants/user.constants';

export type CompanyDocument = HydratedDocument<CompanyModel>;

@Schema({ timestamps: true, _id: true })
export class CompanyModel {
	@Prop({ required: true, unique: true })
	registeredName: string;

	@Prop({ required: true })
	name: string;

	@Prop()
	description: string;

	@Prop({ type: Types.ObjectId, ref: USER_MODEL, required: true })
	owner: Types.ObjectId;

	@Prop({ type: [{ type: Types.ObjectId, ref: USER_MODEL }], default: [] })
	members: Types.ObjectId[];
}

export const CompanySchema = SchemaFactory.createForClass(CompanyModel);

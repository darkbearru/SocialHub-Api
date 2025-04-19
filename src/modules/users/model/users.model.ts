import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../../../common/types/user.types';
import { TSubscription } from '../../subscription/subscription.types';
import { COMPANY_MODEL } from '../../companies/constants/company.constant';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ timestamps: true, _id: true })
export class UserModel {
	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true })
	passwordHash: string;

	@Prop()
	name: string;

	@Prop({ type: () => [UserRole], default: [UserRole.User] })
	role: UserRole[];

	@Prop({
		type: Object,
		default: {
			plan: 'personal',
			expiresAt: null,
		},
	})
	subscription: TSubscription;

	@Prop({ type: [{ type: Types.ObjectId, ref: COMPANY_MODEL }], default: [] })
	companies: Types.ObjectId[];

	@Prop()
	refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

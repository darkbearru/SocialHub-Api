import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../../../common/types/user.types';
import { TUserSubscription } from '../../../common/types/subscription.types';

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
			plan: 'free',
			expiresAt: null,
		},
	})
	subscription: TUserSubscription;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'Company' }] })
	companies: Types.ObjectId[];

	@Prop()
	refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

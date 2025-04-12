import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserModel, UserSchema } from './model/users.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: UserModel.name,
				schema: UserSchema,
				collection: 'User',
			},
		]),
	],
	providers: [UsersService],
	controllers: [UsersController],
	exports: [],
})
export class UsersModule {}

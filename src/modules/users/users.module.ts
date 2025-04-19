import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserSchema } from './model/users.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { USER_MODEL } from './constants/user.constants';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: USER_MODEL,
				schema: UserSchema,
				collection: 'User',
			},
		]),
	],
	providers: [UsersService],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}

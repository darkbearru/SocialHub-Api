import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { LoginUserDto } from '../src/modules/auth/dto/login-user.dto';
import { TJwtResponse } from '../src/common/types/jwt.types';
import { CreateUserDto } from '../src/modules/users/dto/create-user.dto';
import {
	USER_NAME_MIN_ERROR,
	USER_NOT_EMAIL_ERROR,
	USER_PASSWORD_MIN_ERROR,
} from '../src/modules/users/constants/user.constants';
import { MUST_BE_STRING_ERROR } from '../src/common/constants/common.constants';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { AUTH_WRONG_PASSWORD_ERROR } from '../src/modules/auth/constants/auth.constants';

export const testUser: LoginUserDto = {
	email: 'test@test.com',
	password: '12345',
};

export const registerUser: CreateUserDto = {
	name: 'test',
	...testUser,
};

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let response: TJwtResponse;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalInterceptors(new ResponseInterceptor());
		await app.init();
	});

	it('/auth/register (Post): email fail', async () => {
		return request(app.getHttpServer())
			.post('/auth/register')
			.send({ ...registerUser, email: '123' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(USER_NOT_EMAIL_ERROR)).not.toBe(-1);
			});
	});

	it('/auth/register (Post): name short', async () => {
		return request(app.getHttpServer())
			.post('/auth/register')
			.send({ ...registerUser, name: '12' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(USER_NAME_MIN_ERROR)).not.toBe(-1);
			});
	});

	it('/auth/register (Post): name not string', async () => {
		return request(app.getHttpServer())
			.post('/auth/register')
			.send({ ...registerUser, name: 12 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(MUST_BE_STRING_ERROR)).not.toBe(-1);
			});
	});

	it('/auth/register (Post): success', async () => {
		return request(app.getHttpServer())
			.post('/auth/register')
			.send(registerUser)
			.expect(201)
			.then(({ body }: request.Response) => {
				response = body.data;
				expect(body.ok).toBe(true);
				expect(response.accessToken).toBeDefined();
			});
	});

	it('/auth/login (Post): email fail', async () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({ ...testUser, email: '123' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(USER_NOT_EMAIL_ERROR)).not.toBe(-1);
			});
	});

	it('/auth/login (Post): password short', async () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({ ...testUser, password: '123' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(USER_PASSWORD_MIN_ERROR)).not.toBe(-1);
			});
	});

	it('/auth/login (Post): wrong password', async () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({ ...testUser, password: '123345' })
			.expect(401)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(AUTH_WRONG_PASSWORD_ERROR)).not.toBe(-1);
			});
	});

	it('/auth/login (Post): success', async () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send(testUser)
			.expect(200)
			.then(({ body }: request.Response) => {
				response = body.data;
				expect(body.ok).toBe(true);
				expect(response.accessToken).toBeDefined();
			});
	});

	it('/auth/check (Get): fail', async () => {
		return request(app.getHttpServer())
			.get('/auth/check')
			.set('Authorization', `Bearer ${response.refreshToken}`)
			.expect(401);
	});

	it('/auth/check (Get): success', async () => {
		return request(app.getHttpServer())
			.get('/auth/check')
			.set('Authorization', `Bearer ${response.accessToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.ok).toBe(true);
			});
	});

	it('/auth/refresh (Get): fail', async () => {
		return request(app.getHttpServer())
			.get('/auth/refresh')
			.set('Authorization', `Bearer ${response.accessToken}`)
			.expect(401);
	});

	it('/auth/refresh (Get): success', async () => {
		return request(app.getHttpServer())
			.get('/auth/refresh')
			.set('Authorization', `Bearer ${response.refreshToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				response = body.data;
				expect(body.ok).toBe(true);
				expect(response.accessToken).toBeDefined();
			});
	});

	it('/auth/logout (Get): success', async () => {
		return request(app.getHttpServer())
			.get('/auth/logout')
			.set('Authorization', `Bearer ${response.accessToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				console.log(body);
			});
	});

	it('/users (Delete): success', async () => {
		return request(app.getHttpServer())
			.delete(`/users/${response.user.id}`)
			.set('Authorization', `Bearer ${response.accessToken}`)
			.expect(200);
	});

	afterAll(async () => {
		return disconnect();
	});
});

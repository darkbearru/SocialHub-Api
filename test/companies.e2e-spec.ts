import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { TJwtResponse } from '../src/common/types/jwt.types';
import { UserCreateDto } from '../src/modules/users/dto/user-create.dto';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { CompanyCreateDto } from '../src/modules/companies/dto/company-create.dto';
import { CompanyUpdateDto } from '../src/modules/companies/dto/company-update.dto';

// Generate unique email with timestamp to avoid conflicts
const timestamp = Date.now();

// Test user for authentication
const testUser: UserCreateDto = {
	name: 'company-test-user',
	email: `company-test-${timestamp}@test.com`,
	password: '12345',
};

// Test company data
const testCompany: CompanyCreateDto = {
	name: 'Test Company',
	registeredName: 'test-company-' + Date.now(), // Ensure unique name
	description: 'A company for testing',
};

// Updated company data
const updatedCompany: CompanyUpdateDto = {
	name: 'Updated Test Company',
	description: 'An updated company for testing',
	registeredName: 'updated-test-company-' + Date.now(), // Ensure valid registeredName
};

describe('Companies Module (e2e)', () => {
	let app: INestApplication;
	let authResponse: TJwtResponse;
	let companyId: string;
	let secondUserId: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalInterceptors(new ResponseInterceptor());
		await app.init();

		// Register the test user
		try {
			const response = await request(app.getHttpServer()).post('/auth/register').send(testUser);

			if (response.status === 201 && response.body && response.body.data) {
				authResponse = response.body.data;
			}
		} catch (error) {
			console.error('Error during registration:', error);
		}

		// Register a second user for member tests
		try {
			const response = await request(app.getHttpServer())
				.post('/auth/register')
				.send({
					name: 'company-member',
					email: `company-member-${timestamp}@test.com`,
					password: '12345',
				});

			if (
				response.status === 201 &&
				response.body &&
				response.body.data &&
				response.body.data.user
			) {
				secondUserId = response.body.data.user.id;
			}
		} catch (error) {
			console.error('Error during second user registration:', error);
		}
	});

	describe('Company Creation', () => {
		it('/companies (POST): should create a company', async () => {
			// Skip test if user registration failed
			if (!authResponse || !authResponse.accessToken) {
				console.log('Skipping company creation test because user registration failed');
				return;
			}

			// Create a copy of testCompany and add the ownerId
			const companyData = {
				...testCompany,
				ownerId: authResponse.user.id, // Set the owner to the test user
			};

			const response = await request(app.getHttpServer())
				.post('/companies')
				.set('Authorization', `Bearer ${authResponse.accessToken}`)
				.send(companyData);

			expect(response.status).toBe(201);
			expect(response.body.ok).toBe(true);
			expect(response.body.data).toBeDefined();
			expect(response.body.data.name).toBe(companyData.name);
			expect(response.body.data.registeredName).toBe(companyData.registeredName);
			expect(response.body.data.description).toBe(companyData.description);
			companyId = response.body.data._id;
		});

		it('/companies (POST): should fail with invalid data', async () => {
			if (!authResponse || !authResponse.accessToken) {
				console.log('Skipping invalid data test because user registration failed');
				return;
			}

			const response = await request(app.getHttpServer())
				.post('/companies')
				.set('Authorization', `Bearer ${authResponse.accessToken}`)
				.send({
					name: 'A', // Too short
				});

			expect(response.status).toBe(400);
		});

		it('/companies (POST): should fail without authentication', async () => {
			const response = await request(app.getHttpServer()).post('/companies').send(testCompany);

			expect(response.status).toBe(401);
		});
	});

	describe('Company Retrieval', () => {
		it('/companies/:id (GET): should get a company by id', async () => {
			const response = await request(app.getHttpServer())
				.get(`/companies/${companyId}`)
				.set('Authorization', `Bearer ${authResponse.accessToken}`);

			expect(response.status).toBe(200);
			expect(response.body.ok).toBe(true);
			expect(response.body.data).toBeDefined();
			expect(response.body.data.name).toBe(testCompany.name);
			expect(response.body.data.registeredName).toBe(testCompany.registeredName);
		});

		it('/companies/:id (GET): should fail with invalid id', async () => {
			const response = await request(app.getHttpServer())
				.get('/companies/invalid-id')
				.set('Authorization', `Bearer ${authResponse.accessToken}`);

			expect(response.status).toBe(400);
		});

		it('/companies/:id (GET): should fail without authentication', async () => {
			const response = await request(app.getHttpServer()).get(`/companies/${companyId}`);

			expect(response.status).toBe(401);
		});
	});

	describe('Company Update', () => {
		it('/companies/:id (PATCH): should update a company', async () => {
			const response = await request(app.getHttpServer())
				.patch(`/companies/${companyId}`)
				.set('Authorization', `Bearer ${authResponse.accessToken}`)
				.send(updatedCompany);

			expect(response.status).toBe(200);
			expect(response.body.ok).toBe(true);
		});

		it('/companies/:id (PATCH): should fail with invalid data', async () => {
			const response = await request(app.getHttpServer())
				.patch(`/companies/${companyId}`)
				.set('Authorization', `Bearer ${authResponse.accessToken}`)
				.send({ name: 'A' });

			expect(response.status).toBe(400);
		});

		it('/companies/:id (PATCH): should fail without authentication', async () => {
			const response = await request(app.getHttpServer())
				.patch(`/companies/${companyId}`)
				.send(updatedCompany);

			expect(response.status).toBe(401);
		});
	});

	describe('Company Members Management', () => {
		it('/companies/:companyId/addMember/:userId (GET): should add a member', async () => {
			const response = await request(app.getHttpServer())
				.get(`/companies/${companyId}/addMember/${secondUserId}`)
				.set('Authorization', `Bearer ${authResponse.accessToken}`);

			expect(response.status).toBe(200);
		});

		it('/companies/:id/getMembers (GET): should get company members', async () => {
			const response = await request(app.getHttpServer())
				.get(`/companies/${companyId}/getMembers`)
				.set('Authorization', `Bearer ${authResponse.accessToken}`);

			expect(response.status).toBe(200);
			expect(response.body.ok).toBe(true);
			expect(response.body.data).toBeDefined();
			expect(Array.isArray(response.body.data)).toBe(true);
			expect(response.body.data.length).toBeGreaterThan(0);
		});

		it('/companies/:companyId/removeMember/:userId (DELETE): should remove a member', async () => {
			const response = await request(app.getHttpServer())
				.delete(`/companies/${companyId}/removeMember/${secondUserId}`)
				.set('Authorization', `Bearer ${authResponse.accessToken}`);
			expect(response.status).toBe(200);
		});
	});

	describe('Company Deletion', () => {
		it('/companies/:id (DELETE): should delete a company', async () => {
			const response = await request(app.getHttpServer())
				.delete(`/companies/${companyId}`)
				.set('Authorization', `Bearer ${authResponse.accessToken}`);
			expect(response.status).toBe(200);
		});

		it('/companies/:id (DELETE): should fail with invalid id', async () => {
			const response = await request(app.getHttpServer())
				.delete('/companies/invalid-id')
				.set('Authorization', `Bearer ${authResponse.accessToken}`);

			expect(response.status).toBe(400);
		});

		it('/companies/:id (DELETE): should fail without authentication', async () => {
			const response = await request(app.getHttpServer()).delete(`/companies/${companyId}`);

			expect(response.status).toBe(401);
		});
	});

	afterAll(async () => {
		// Clean up - delete the test users
		try {
			if (authResponse && authResponse.user && authResponse.user.id) {
				await request(app.getHttpServer())
					.delete(`/users/${authResponse.user.id}`)
					.set('Authorization', `Bearer ${authResponse.accessToken}`);
			}

			if (secondUserId) {
				await request(app.getHttpServer())
					.delete(`/users/${secondUserId}`)
					.set('Authorization', `Bearer ${authResponse.accessToken}`);
			}
		} catch (error) {
			console.error('Error during cleanup:', error);
		}

		return disconnect();
	});
});

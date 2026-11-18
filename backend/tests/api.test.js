import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, disconnectTestDB } from './testDb.js';
import { User } from '../src/models/User.js';
import { Package } from '../src/models/Package.js';
import { Booking } from '../src/models/Booking.js';
import { Payment } from '../src/models/Payment.js';
import { RefreshToken } from '../src/models/RefreshToken.js';
import { Review } from '../src/models/Review.js';
import { Wishlist } from '../src/models/Wishlist.js';
import { Enquiry } from '../src/models/Enquiry.js';
import { processExpiredBookings } from '../src/scripts/expireBookingsJob.js';
import { env } from '../src/config/env.js';
import { hashToken } from '../src/utils/tokens.js';

beforeAll(async () => {
  await connectTestDB();
}, 180000);

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('1. Health, CORS, and Global Error Handling', () => {
  test('GET /api/health should return 200 with database status and uptime', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.database.connected).toBe(true);
  });

  test('CORS: Should allow allowed Origin and handle preflight OPTIONS', async () => {
    const res = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  test('CORS: Should reject disallowed Origin with 403', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious-site.com');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('CORS_ERROR');
  });

  test('Malformed JSON payload should return 400 MALFORMED_JSON', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "test@test.com", "password": ');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('MALFORMED_JSON');
  });

  test('Unknown route should return 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('2. Authentication & Authorization Flow', () => {
  const userPayload = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
  };

  test('POST /api/auth/register should create user and return accessToken + refresh cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(userPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(userPayload.email);
    expect(res.body.data.user.role).toBe('user'); // Never admin

    // Check refresh cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/refreshToken=/);
    expect(cookies[0]).toMatch(/HttpOnly/i);
    expect(cookies[0]).toMatch(/Path=\/api\/auth/i);
  });

  test('POST /api/auth/register should reject duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(userPayload);
    const res = await request(app).post('/api/auth/register').send(userPayload);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE_EMAIL');
  });

  test('POST /api/auth/register should reject weak passwords (< 8 chars, no number)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Short', email: 'short@example.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/login should authenticate valid user', async () => {
    await request(app).post('/api/auth/register').send(userPayload);
    const res = await request(app).post('/api/auth/login').send({
      email: userPayload.email,
      password: userPayload.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('POST /api/auth/login should fail with generic message for wrong password or email', async () => {
    await request(app).post('/api/auth/register').send(userPayload);
    const res = await request(app).post('/api/auth/login').send({
      email: userPayload.email,
      password: 'WrongPassword999',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');

    // Non-existent email executes dummy bcrypt compare
    const res2 = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'SomePassword123',
    });
    expect(res2.status).toBe(401);
    expect(res2.body.message).toBe('Invalid email or password');
  });

  test('Blocked user cannot login or access protected routes', async () => {
    const blockedPayload = {
      name: 'Blocked User',
      email: 'blocked@example.com',
      password: 'Password123',
    };
    const regRes = await request(app).post('/api/auth/register').send(blockedPayload);
    const token = regRes.body.data.accessToken;

    await User.updateOne({ email: blockedPayload.email }, { isBlocked: true });

    // Blocked on login
    const loginRes = await request(app).post('/api/auth/login').send({
      email: blockedPayload.email,
      password: blockedPayload.password,
    });
    expect(loginRes.status).toBe(403);
    expect(loginRes.body.code).toBe('USER_BLOCKED');

    // Blocked on protect middleware
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(403);
    expect(meRes.body.code).toBe('USER_BLOCKED');
  });

  test('Access token expired returns 401 with code TOKEN_EXPIRED', async () => {
    const expiredToken = jwt.sign(
      { sub: new mongoose.Types.ObjectId().toString(), role: 'user' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '-1s', algorithm: 'HS256' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });

  test('Refresh token rotation issues new pair and revokes old', async () => {
    const regRes = await request(app).post('/api/auth/register').send(userPayload);
    const cookieHeader = regRes.headers['set-cookie'];

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookieHeader);
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    // Verify old refresh token is marked revoked
    const oldCookie = cookieHeader[0].match(/refreshToken=([^;]+)/)[1];
    const oldRecord = await RefreshToken.findOne({ tokenHash: hashToken(oldCookie) });
    expect(oldRecord.revoked).toBe(true);
    expect(oldRecord.replacedAt).toBeDefined();
  });

  test('Parallel-refresh race condition within grace window allows second request', async () => {
    const regRes = await request(app).post('/api/auth/register').send(userPayload);
    const cookieHeader = regRes.headers['set-cookie'];

    // First refresh call (rotates token)
    const refresh1 = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookieHeader);
    expect(refresh1.status).toBe(200);

    // Second simultaneous request with same cookie within grace window (e.g. 50ms later)
    const refresh2 = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookieHeader);
    expect(refresh2.status).toBe(200);
    expect(refresh2.body.data.accessToken).toBeDefined();
  });

  test('Token reuse outside grace window terminates entire token family', async () => {
    const regRes = await request(app).post('/api/auth/register').send(userPayload);
    const cookieHeader = regRes.headers['set-cookie'];
    const rawToken = cookieHeader[0].match(/refreshToken=([^;]+)/)[1];

    // Simulate rotation 15 seconds ago
    const fifteenSecondsAgo = new Date(Date.now() - 15000);
    await RefreshToken.updateOne(
      { tokenHash: hashToken(rawToken) },
      { revoked: true, replacedAt: fifteenSecondsAgo }
    );

    // Replay revoked token outside grace window
    const reuseRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookieHeader);
    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.code).toBe('SESSION_REVOKED');

    // All family tokens should now be revoked
    const activeInFamily = await RefreshToken.find({ revoked: false });
    expect(activeInFamily.length).toBe(0);
  });

  test('PATCH /api/auth/change-password revokes all sessions and updates password', async () => {
    const regRes = await request(app).post('/api/auth/register').send(userPayload);
    const token = regRes.body.data.accessToken;

    const changeRes = await request(app)
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: userPayload.password,
        newPassword: 'NewPassword999',
      });
    expect(changeRes.status).toBe(200);

    // Old password fails
    const oldLogin = await request(app).post('/api/auth/login').send({
      email: userPayload.email,
      password: userPayload.password,
    });
    expect(oldLogin.status).toBe(401);

    // New password succeeds
    const newLogin = await request(app).post('/api/auth/login').send({
      email: userPayload.email,
      password: 'NewPassword999',
    });
    expect(newLogin.status).toBe(200);
  });

  test('Role restriction: User gets 403 on admin routes, Admin passes', async () => {
    const userRes = await request(app).post('/api/auth/register').send(userPayload);
    const userToken = userRes.body.data.accessToken;

    const admin = await User.create({
      name: 'Admin Boss',
      email: 'boss@admin.com',
      password: 'Password123',
      role: 'admin',
    });
    const adminToken = jwt.sign(
      { sub: admin._id.toString(), role: 'admin' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m', algorithm: 'HS256' }
    );

    // User gets 403
    const forbiddenRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.code).toBe('FORBIDDEN');

    // Admin gets 200
    const adminRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
  });

  test('Admin dashboard reports account access totals and filters users by status', async () => {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin_dashboard@test.com',
      password: 'Password123',
      role: 'admin',
    });
    await User.create([
      { name: 'Active User', email: 'active_dashboard@test.com', password: 'Password123' },
      {
        name: 'Suspended User',
        email: 'suspended_dashboard@test.com',
        password: 'Password123',
        isBlocked: true,
      },
    ]);
    const adminToken = jwt.sign(
      { sub: admin._id.toString(), role: 'admin' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m', algorithm: 'HS256' }
    );

    const [statsRes, suspendedUsersRes, activeUsersRes] = await Promise.all([
      request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`),
      request(app)
        .get('/api/admin/users?status=suspended')
        .set('Authorization', `Bearer ${adminToken}`),
      request(app)
        .get('/api/admin/users?status=active')
        .set('Authorization', `Bearer ${adminToken}`),
    ]);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data).toMatchObject({
      totalUsers: 3,
      activeUsers: 2,
      suspendedUsers: 1,
    });
    expect(suspendedUsersRes.body.data.users.map((user) => user.email)).toEqual([
      'suspended_dashboard@test.com',
    ]);
    expect(activeUsersRes.body.data.total).toBe(2);
  });
});

describe('3. Travel Packages and Pagination', () => {
  let adminToken;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin_test@test.com',
      password: 'Password123',
      role: 'admin',
    });
    adminToken = jwt.sign(
      { sub: admin._id.toString(), role: 'admin' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m', algorithm: 'HS256' }
    );

    // Create 3 active packages
    await Package.create([
      {
        title: 'Goa Golden Beach',
        slug: 'goa-golden-beach',
        destination: 'Goa',
        description: 'Sunny beaches and coastal parties.',
        price: 500,
        durationDays: 3,
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        totalSeats: 10,
        availableSeats: 10,
        category: 'beach',
      },
      {
        title: 'Manali Snow Mountain Trek',
        slug: 'manali-snow-mountain-trek',
        destination: 'Manali',
        description: 'High altitude hiking adventure.',
        price: 800,
        durationDays: 5,
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        totalSeats: 20,
        availableSeats: 20,
        category: 'mountain',
      },
      {
        title: 'Jaipur Heritage Palace Tour',
        slug: 'jaipur-heritage-palace-tour',
        destination: 'Jaipur',
        description: 'Explore the pink city palaces.',
        price: 600,
        durationDays: 4,
        startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        totalSeats: 15,
        availableSeats: 15,
        category: 'city',
      },
    ]);
  });

  test('GET /api/packages should list active packages with pagination info', async () => {
    const res = await request(app).get('/api/packages?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data.packages.length).toBe(2);
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.totalPages).toBe(2);
    expect(res.body.data.hasNext).toBe(true);
  });

  test('Page beyond range returns empty data, not an error', async () => {
    const res = await request(app).get('/api/packages?page=10&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.data.packages).toEqual([]);
    expect(res.body.data.page).toBe(10);
  });

  test('Search handles regex special characters without breaking', async () => {
    const res = await request(app).get('/api/packages?search=Goa.*+?^${}()|[]');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.packages)).toBe(true);
  });

  test('Admin cannot reduce totalSeats below already-booked seats', async () => {
    const pkg = await Package.findOne({ slug: 'goa-golden-beach' });
    // Simulate 4 seats already booked (availableSeats = 6)
    pkg.availableSeats = 6;
    await pkg.save();

    const res = await request(app)
      .patch(`/api/packages/${pkg._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ totalSeats: 3 }); // Less than booked seats (4)
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_SEAT_COUNT');
  });

  test('Invalid ObjectId returns 400 with INVALID_ID', async () => {
    const res = await request(app).get('/api/packages/invalid-id-format');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_ID');
  });
});

describe('4. Bookings, Concurrency, and Seat Allocation', () => {
  let userToken;
  let pkg;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Traveler Joe',
      email: 'joe@traveler.com',
      password: 'Password123',
    });
    userToken = jwt.sign(
      { sub: user._id.toString(), role: 'user' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m', algorithm: 'HS256' }
    );

    pkg = await Package.create({
      title: 'Limited Seats Safari',
      slug: 'limited-seats-safari',
      destination: 'Kenya',
      description: 'Wildlife safari with only 2 remaining seats.',
      price: 1000,
      durationDays: 4,
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      totalSeats: 2,
      availableSeats: 2, // Exactly 2 seats left
      category: 'adventure',
    });
  });

  test('5 parallel booking requests for last 2 seats prevents overbooking', async () => {
    const payload = {
      packageId: pkg._id.toString(),
      travelers: 1,
      travelersInfo: [{ name: 'Solo Traveler', age: 30, gender: 'other' }],
    };

    const requests = Array.from({ length: 5 }, () =>
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload)
    );

    const results = await Promise.all(requests);
    const successCount = results.filter((r) => r.status === 201).length;
    const rejectedCount = results.filter((r) => r.status === 400).length;

    expect(successCount).toBe(2); // Exactly 2 seats booked
    expect(rejectedCount).toBe(3); // Other 3 safely rejected

    const updatedPkg = await Package.findById(pkg._id);
    expect(updatedPkg.availableSeats).toBe(0);
  });

  test('travelersInfo length mismatch is rejected with 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        packageId: pkg._id.toString(),
        travelers: 2,
        travelersInfo: [{ name: 'Single Traveler', age: 25 }], // Only 1 info item for 2 travelers
      });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('Cancel booking restores seats once', async () => {
    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        packageId: pkg._id.toString(),
        travelers: 2,
        travelersInfo: [
          { name: 'Traveler 1', age: 25 },
          { name: 'Traveler 2', age: 27 },
        ],
      });
    const bookingId = bookingRes.body.data.booking._id;

    let currentPkg = await Package.findById(pkg._id);
    expect(currentPkg.availableSeats).toBe(0);

    const cancelRes = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(cancelRes.status).toBe(200);

    currentPkg = await Package.findById(pkg._id);
    expect(currentPkg.availableSeats).toBe(2); // Restored

    // Double cancel fails cleanly and does not double-restore
    const doubleCancel = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(doubleCancel.status).toBe(400);

    currentPkg = await Package.findById(pkg._id);
    expect(currentPkg.availableSeats).toBe(2);
  });

  test('Background expiry job cancels expired pending bookings and returns seats', async () => {
    const booking = await Booking.create({
      user: new mongoose.Types.ObjectId(),
      package: pkg._id,
      travelers: 2,
      travelersInfo: [{ name: 'T1', age: 20 }, { name: 'T2', age: 21 }],
      totalAmount: 2000,
      status: 'pending',
      expiresAt: new Date(Date.now() - 1000), // Already expired
    });
    await Package.updateOne({ _id: pkg._id }, { availableSeats: 0 });

    await processExpiredBookings();

    const updatedBooking = await Booking.findById(booking._id);
    expect(updatedBooking.status).toBe('cancelled');

    const updatedPkg = await Package.findById(pkg._id);
    expect(updatedPkg.availableSeats).toBe(2); // Restored
  });
});

describe('5. Fake Payment Simulation & Idempotency', () => {
  let userToken;
  let bookingId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Payer Alex',
      email: 'alex@payer.com',
      password: 'Password123',
    });
    userToken = jwt.sign(
      { sub: user._id.toString(), role: 'user' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m', algorithm: 'HS256' }
    );

    const pkg = await Package.create({
      title: 'Island Escape',
      slug: 'island-escape',
      destination: 'Maldives',
      description: 'Luxury water villa resort.',
      price: 1500,
      durationDays: 4,
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      totalSeats: 10,
      availableSeats: 10,
      category: 'beach',
    });

    const booking = await Booking.create({
      user: user._id,
      package: pkg._id,
      travelers: 1,
      travelersInfo: [{ name: 'Alex Payer', age: 28 }],
      totalAmount: 1500,
      status: 'pending',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    bookingId = booking._id.toString();
  });

  test('Successful payment confirms booking and records transactionId', async () => {
    const initRes = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookingId });
    const paymentId = initRes.body.data.payment._id;

    const confirmRes = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        cardNumber: '4242424242424242',
        expiry: '12/28',
        cvv: '123',
        cardHolder: 'Alex Payer',
      });
    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.payment.status).toBe('success');
    expect(confirmRes.body.data.payment.transactionId).toMatch(/^TXN-/);
    expect(confirmRes.body.data.payment.cardLast4).toBe('4242');

    const booking = await Booking.findById(bookingId);
    expect(booking.status).toBe('confirmed');
  });

  test('Declined card returns 400 PAYMENT_DECLINED and allows retry', async () => {
    const initRes = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookingId });
    const paymentId = initRes.body.data.payment._id;

    // First attempt: declined card
    const declinedRes = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        cardNumber: '4000000000000002',
        expiry: '12/28',
        cvv: '123',
        cardHolder: 'Alex Payer',
      });
    expect(declinedRes.status).toBe(400);
    expect(declinedRes.body.code).toBe('PAYMENT_DECLINED');

    // Retry with valid card succeeds
    const retryRes = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        cardNumber: '4242424242424242',
        expiry: '12/28',
        cvv: '123',
        cardHolder: 'Alex Payer',
      });
    expect(retryRes.status).toBe(200);
    expect(retryRes.body.data.payment.status).toBe('success');
  });

  test('Double confirmation of already successful payment is idempotent', async () => {
    const initRes = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookingId });
    const paymentId = initRes.body.data.payment._id;

    const payload = {
      cardNumber: '4242424242424242',
      expiry: '12/28',
      cvv: '123',
      cardHolder: 'Alex Payer',
    };

    const res1 = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload);
    expect(res1.status).toBe(200);

    // Second call immediately returns existing success
    const res2 = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload);
    expect(res2.status).toBe(200);
    expect(res2.body.data.payment.transactionId).toBe(res1.body.data.payment.transactionId);
  });
});

describe('6. Reviews, Wishlist, and Enquiries', () => {
  let userToken;
  let userId;
  let pkgId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Reviewer Sam',
      email: 'sam@reviewer.com',
      password: 'Password123',
    });
    userId = user._id;
    userToken = jwt.sign(
      { sub: user._id.toString(), role: 'user' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m', algorithm: 'HS256' }
    );

    const pkg = await Package.create({
      title: 'Completed Expedition',
      slug: 'completed-expedition',
      destination: 'Himalayas',
      description: 'Past expedition for review testing.',
      price: 1200,
      durationDays: 5,
      // Trip ended 2 days ago
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      totalSeats: 10,
      availableSeats: 5,
      category: 'mountain',
    });
    pkgId = pkg._id.toString();
  });

  test('Review blocked without confirmed booking with 403 NO_CONFIRMED_BOOKING', async () => {
    const res = await request(app)
      .post(`/api/packages/${pkgId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, comment: 'Awesome trip!' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('NO_CONFIRMED_BOOKING');
  });

  test('Review allowed after trip conclusion and aggregates package rating', async () => {
    // Insert confirmed booking directly for past trip
    await Booking.create({
      user: userId,
      package: pkgId,
      travelers: 1,
      travelersInfo: [{ name: 'Sam', age: 30 }],
      totalAmount: 1200,
      status: 'confirmed',
      expiresAt: new Date(),
    });

    const res = await request(app)
      .post(`/api/packages/${pkgId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, comment: 'Simply unforgettable journey!' });
    expect(res.status).toBe(201);

    // Verify package rating recomputed
    const updatedPkg = await Package.findById(pkgId);
    expect(updatedPkg.avgRating).toBe(5);
    expect(updatedPkg.reviewCount).toBe(1);

    // Duplicate review rejected with 409
    const dupRes = await request(app)
      .post(`/api/packages/${pkgId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 4, comment: 'Second review attempt' });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.code).toBe('DUPLICATE_REVIEW');
  });

  test('Wishlist double add is idempotent', async () => {
    const res1 = await request(app)
      .post(`/api/wishlist/${pkgId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res1.status).toBe(200);

    const res2 = await request(app)
      .post(`/api/wishlist/${pkgId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res2.status).toBe(200);

    const count = await Wishlist.countDocuments({ user: userId, package: pkgId });
    expect(count).toBe(1);
  });

  test('Public enquiry submission succeeds and respects schema', async () => {
    const res = await request(app).post('/api/enquiries').send({
      name: 'Curious Traveler',
      email: 'curious@traveler.com',
      message: 'Do you offer group discounts for 10+ people?',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enquiry.status).toBe('new');
  });
});

describe('7. AI Chatbot Error Handling', () => {
  test('POST /api/chat returns 503 if GROQ_API_KEY is not set', async () => {
    const res = await request(app).post('/api/chat').send({
      message: 'Tell me about Bali packages',
    });
    expect(res.status).toBe(503);
    expect(res.body.code).toBe('SERVICE_UNAVAILABLE');
  });
});

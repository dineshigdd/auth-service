import request from 'supertest';
import app from '../src/app'; // your Express app
import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env.test', override: true });

const createToken = (role ) => {
    
  return jwt.sign({ id: '123', role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};
  
// describe("GET /auth/admin", () => {
//   it("should deny access without token", async () => {
//     const res = await request(app).get("/auth/admin");
//     expect(res.statusCode).toBe(401);
//   });

//   it("should allow access for admin role", async () => {
//     // create a valid token for an admin user
//     const token = createToken("admin"); // your helper function
//     const res = await request(app)
//       .get("/auth/admin")
//       .set("Authorization", `Bearer ${token}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.text).toBe("Welcome Admin");
//   });
// });

describe('Role-based access control', () => {
  it('should allow access to admin route for admin role', async () => {
    const token = createToken('admin');
   
    const res = await request(app)
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Welcome'); // or whatever your route returns
  });

  it('should deny access to admin route for non-admin role', async () => {
    const token = createToken('user');

    const res = await request(app)
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Access denied: insufficient permissions');
  });

  it('should deny access with no token', async () => {
    const res = await request(app).get('/auth/admin');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Not authorized, no token');
  });
});

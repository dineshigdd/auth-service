
## 🛡️ Auth-Service – Authentication Microservice

### 📌 Overview
Auth-Service is a lightweight, scalable authentication service built for modern web applications. It handles user registration, login, token-based authentication, and role-based access control.

---

### 🚀 Features
- 🔐 JWT-based authentication
- 👥 User registration & login
- 🔄 Token refresh flow
- 🧠 Role-based access control
- 🧊 Password hashing (bcrypt)



### 🧰 Tech Stack
| Layer         | Technology               |
|-------------- |--------------------------|
| Language      | Node.js / JavaScript     |
| Framework     | Express.js               |
| ORM           | Prisma                   |
| Auth          | JWT                      |
| Validation    | Zod                      |
| Security      | bcrypt                   |
| Middleware    | cookie-parser, CORS      |
| Config        | dotenv                   |
| Database      | PostgreSQL   |

---

### 📦 Installation

```bash
https://github.com/dineshigdd/auth-service.git
cd auth-services
npm install
```

Create a `.env` file with your config:

```env
PORT=4000
DATABASE_URL=your_db_url
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

---

### 🧪 Running Tests

```bash
npm test
```

---

### 📬 API Endpoints

| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| POST   | `/api/register`  | Register new user        |
| POST   | `/api/login`     | Authenticate user        |
| GET    | `/api/profile`   | Get user profile (auth)  |
| POST   | `/api/refresh`   | Refresh access token     |

You can include a Postman collection or for easy testing.

---

### 🧠 Architecture Notes
- Stateless JWT auth with refresh tokens
- Middleware-based route protection
- Modular service/controller structure
- Scalable for microservices

---

### 📈 Future Improvements
- 🧹 Input validation & error handling  
- 🔐 Multi-factor authentication  
- 🧨 Rate limiting & brute-force protection  
- 🧪 Unit & integration tests  
- 🛠️ Admin dashboard  
- 📧 Email verification  
- 🐳 Docker support  


---

### 🙋‍♂️ Author
Built by [Daminda Dinesh] – passionate about secure, scalable backend systems.

---

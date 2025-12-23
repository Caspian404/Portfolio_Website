# Student Information System — Setup Guide

A secure full-stack web application with role-based access control, rate limiting, and HTTPS encryption.

## Stack
- **Backend**: Node.js + Express + MySQL (HTTPS on port 3000)
- **Frontend**: Angular (HTTP on port 4200)
- **Databases**: `login_db` and `info_db`
- **Security**: JWT authentication, rate limiting, reCAPTCHA, SSL/TLS

---

## Prerequisites

### Required Software

1. **Node.js v20.19+ or v22.12+**
   - Download: https://nodejs.org/
   - Verify installation:
     ```bash
     node -v
     npm -v
     ```
   - **Note**: If using Angular CLI, you need Node.js v20.19 or higher

2. **Angular CLI**
   - Install globally:
     ```bash
     npm install -g @angular/cli
     ng version
     ```

3. **MySQL Community Server**
   - Download: https://dev.mysql.com/downloads/mysql/
   - Set a root password during installation
   - Verify:
     ```bash
     mysql --version
     ```

4. **Optional: nvm (Node Version Manager)**
   - Windows: https://github.com/coreybutler/nvm-windows
   - Allows easy switching between Node versions

---

## Quick Start

### 1. Configure Environment Variables

Create a `.env` file in the project root with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_long_random_secret_key_here
RECAPTCHA_SECRET_KEY=6LdJwS0sAAAAAOmAa6J6-D7A_Mj3lIdS6ybJq0aE
PORT=3000
```

**Important:**
- Replace `your_mysql_password` with your actual MySQL root password
- Generate a strong `JWT_SECRET` (at least 32 characters)
- Get reCAPTCHA keys from https://www.google.com/recaptcha/admin
- Never commit `.env` to version control

### 2. Install Dependencies

Install backend dependencies:
```bash
cd comp-sec-proj-kev
npm install
```

Install frontend dependencies:
```bash
cd frontend
npm install
```

**Note**: If you get dependency conflicts with Angular, use:
```bash
npm install --legacy-peer-deps
```

### 3. Generate SSL Certificates

The backend requires HTTPS. Generate SSL certificates:

**Windows (PowerShell):**
```powershell
cd backend
# Using mkcert (recommended for local development)
mkcert localhost 127.0.0.1 ::1

# Or using OpenSSL
openssl req -nodes -new -x509 -keyout localhost+2-key.pem -out localhost+2.pem -days 365
```

**Linux/Mac:**
```bash
cd backend
mkcert localhost 127.0.0.1 ::1
# Or
openssl req -nodes -new -x509 -keyout localhost+2-key.pem -out localhost+2.pem -days 365
```

The certificates should be named:
- `localhost+2-key.pem` (private key)
- `localhost+2.pem` (certificate)

### 4. Set Up the Databases

1. Open MySQL client:
   ```bash
   mysql -u root -p
   ```

2. Run the setup script (replace with your actual path):
   
   **Windows:**
   ```sql
   SOURCE C:/Users/YourName/Downloads/comp-security-project/comp-sec-proj-kev/backend/setup-database.sql;
   ```
   
   **Linux/Mac:**
   ```sql
   source backend/setup-database.sql;
   ```

3. **(Optional)** Seed test data:
   ```sql
   SOURCE C:/path/to/backend/seed-test-data.sql;
   ```

4. Exit MySQL:
   ```sql
   EXIT;
   ```

**Default Test Credentials:**
- **Admin**: `admin@university.edu` / `Admin123!`
- **Faculty**: `faculty@university.edu` / `Faculty123!`
- **Students**: `john.doe@student.edu` / `Student123!`

### 5. Start the Servers

**Backend (Terminal 1):**
```bash
cd comp-sec-proj-kev
npm start
```

✅ Backend runs on **https://localhost:3000** (HTTPS)
- You should see: "Secure server is running on port 3000"
- "Connected to login database"
- "Connected to information database"

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

✅ Frontend runs on **http://localhost:4200** (HTTP)
- Open your browser to http://localhost:4200

**To host on all network interfaces (VPN/LAN access):**
```bash
cd frontend
npm start -- --host 0.0.0.0
```
Then access via your IP address: `http://YOUR_IP:4200`

---

## Using the Application

### Default Users
Login at http://localhost:4200 with these test accounts:

| Role | Email | Password | Capabilities |
|------|-------|----------|--------------|
| **Admin** | admin@university.edu | Admin123! | Manage all users, view all transactions |
| **Faculty** | faculty@university.edu | Faculty123! | Manage students, charge tuition |
| **Student** | john.doe@student.edu | Student123! | View profile, GPA, balance |

### Role-Based Features

**Admin Dashboard:**
- Create/delete users (students, faculty, admins)
- View all system transactions
- Manage user roles and permissions

**Faculty Dashboard:**
- Create student accounts
- Update student GPA and credits
- Charge tuition fees
- View all students

**Student Dashboard:**
- View personal profile
- Check GPA and total credits
- View account balance
- Update contact information
- View transaction history

---

## Security Features

### Rate Limiting & Brute Force Protection
- **Login attempts**: 5 attempts per minute per IP
- **Lockout duration**: 1 minute after exceeding limit
- **Sensitive operations**: 10 requests per minute per IP
- **General API**: 100 requests per minute per IP
- Prevents automated attacks and credential stuffing

### reCAPTCHA Protection
- Google reCAPTCHA v2 integration
- Required for all login attempts
- Prevents automated bot attacks
- Configure in `.env` with your reCAPTCHA keys

### SSL/TLS Encryption
- Backend runs on HTTPS (port 3000)
- All API communication encrypted
- Self-signed certificates for development
- Requires SSL certificate files in `backend/`

### Authentication & Authorization
- **JWT (JSON Web Tokens)** with 3-minute expiration
- **Bcrypt password hashing** (10 salt rounds)
- **Role-based access control** (Admin, Faculty, Student)
- **Username hashing** for additional privacy
- HTTP-only token storage

### Data Protection
- Separate databases for login and information
- SQL injection prevention via parameterized queries
- CORS configured for frontend origin
- Transaction logging for audit trail

---

## API URL Configuration

To change the backend URL (for deployment or VPN access):

**Edit these files:**
- `frontend/src/app/services/auth.service.ts` (Line 18)
- `frontend/src/app/services/faculty.service.ts` (Line 67)
- `frontend/src/app/services/student.service.ts` (Line 51)

Change from:
```typescript
private apiUrl = 'https://localhost:3000/api';
```

To your server IP/domain:
```typescript
private apiUrl = 'https://YOUR_IP_OR_DOMAIN:3000/api';
```

---

## Common Commands

**Backend:**
```bash
npm start          # Start HTTPS server
npm run dev        # Start with nodemon (auto-reload)
```

**Frontend:**
```bash
npm start          # Start Angular dev server (localhost only)
npm start -- --host 0.0.0.0   # Host on all network interfaces
ng build           # Build for production
```

**Database:**
```bash
mysql -u root -p   # Open MySQL client
```

---

## Troubleshooting

### MySQL Connection Issues

**Problem:** "Access denied for user 'root'@'localhost'"

**Solutions:**
1. Verify MySQL is running:
   ```bash
   # Windows
   services.msc  # Check MySQL80 service
   
   # Linux/Mac
   sudo systemctl status mysql
   ```
2. Check `.env` credentials match your MySQL setup
3. Test connection: `mysql -u root -p`
4. Verify databases exist: `SHOW DATABASES;`

---

### Node.js Version Issues

**Problem:** "Angular CLI requires a minimum Node.js version of v20.19"

**Solutions:**
1. Check your Node version: `node -v`
2. Install correct version:
   ```bash
   # Using nvm (recommended)
   nvm install 20.19.0
   nvm use 20.19.0
   
   # Or download from nodejs.org
   ```
3. Restart your terminal after installation

---

### SSL Certificate Errors

**Problem:** Backend won't start - certificate file not found

**Solutions:**
1. Ensure certificates exist in `backend/` directory:
   - `localhost+2-key.pem`
   - `localhost+2.pem`
2. Generate if missing (see Setup Step 3)
3. Check file names match exactly

**Browser SSL Warning:**
- **Normal for development with self-signed certificates**
- Click "Advanced" → "Proceed to localhost (unsafe)"
- Or install mkcert root certificate for trusted local certs

---

### Port Already in Use

**Problem:** "Error: listen EADDRINUSE: address already in use"

**Solutions:**

**Windows:**
```powershell
# Find process on port 3000 or 4200
netstat -ano | findstr :3000
# Kill the process (replace PID)
taskkill /F /PID <PID>
```

**Linux/Mac:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
lsof -ti:4200 | xargs kill -9
```

---

### Frontend Dependency Conflicts

**Problem:** "npm error ERESOLVE could not resolve"

**Solutions:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

### reCAPTCHA Not Working

**Problem:** Login fails even with correct credentials

**Solutions:**
1. Get reCAPTCHA keys from https://www.google.com/recaptcha/admin
2. Add `RECAPTCHA_SECRET_KEY` to `.env`
3. Check browser console for reCAPTCHA errors
4. Restart backend after updating `.env`

---

### Rate Limit Lockout

**Problem:** "Too many login attempts from this IP"

**Solution:**
- Wait 1 minute for lockout to expire
- Or restart the backend server to reset rate limit counters
- Current limits: 5 attempts per minute

---

### Network Access Issues

**Problem:** Can't access from other devices on network

**Solutions:**
1. Start frontend with network access:
   ```bash
   npm start -- --host 0.0.0.0
   ```
2. Check firewall allows ports 3000 and 4200
3. Use your machine's IP address: `http://YOUR_IP:4200`
4. Update API URLs in frontend services if needed

---

## Quick Reference

**Check if servers are running:**
```bash
# Windows
netstat -ano | findstr ":3000 :4200"

# Linux/Mac
lsof -i :3000
lsof -i :4200
```

**Test backend API:**
```bash
curl -k https://localhost:3000
# Should return: {"message":"Student Information System Backend"}
```

**View logs:**
- Backend: Check terminal running `npm start`
- Frontend: Check browser console (F12)
- MySQL: Check MySQL error logs

---

## Project Structure

```
comp-sec-proj-kev/
├── backend/
│   ├── middleware/
│   │   └── auth.js                    # JWT verification middleware
│   ├── server.js                      # Main Express server with HTTPS
│   ├── setup-database.sql             # Database initialization script
│   ├── seed-test-data.sql             # Test data for demo
│   ├── localhost+2-key.pem            # SSL private key (generate)
│   └── localhost+2.pem                # SSL certificate (generate)
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/            # Angular components
│   │   │   │   ├── login/
│   │   │   │   ├── admin-dashboard/
│   │   │   │   ├── faculty-dashboard/
│   │   │   │   └── student-dashboard/
│   │   │   ├── services/              # API services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── faculty.service.ts
│   │   │   │   └── student.service.ts
│   │   │   └── guards/                # Route guards
│   │   └── index.html
│   └── package.json
├── .env                               # Environment variables (create this)
├── package.json                       # Backend dependencies
└── README.md                          # This file
```

---

## Production Deployment Notes

⚠️ **This application is configured for local development.** For production deployment:

### Security Hardening Required:
1. **Change all default passwords** in the database
2. **Use production-grade SSL certificates** (Let's Encrypt, commercial CA)
3. **Update JWT_SECRET** to a cryptographically secure random string
4. **Configure proper CORS** origins (not wildcard)
5. **Increase rate limit windows** back to 15 minutes
6. **Set up proper database backups**
7. **Enable MySQL SSL connections**
8. **Use environment-specific configurations**
9. **Set NODE_ENV=production**
10. **Implement proper logging and monitoring**

### Backend Deployment:
- Use a process manager (PM2, systemd)
- Set up reverse proxy (nginx, Apache)
- Configure firewall rules
- Use production database server
- Enable HTTPS only

### Frontend Deployment:
- Build for production: `ng build --configuration production`
- Serve static files via nginx/Apache
- Update API URLs to production backend
- Configure proper caching headers

---

## License & Credits

This project was developed as a computer security demonstration for educational purposes.

**Contributors:**
- Security features and rate limiting implementation
- HTTPS/SSL integration
- Database architecture and setup scripts
- Frontend Angular application

**Technologies:**
- Node.js & Express
- Angular
- MySQL
- JWT & Bcrypt
- Google reCAPTCHA

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Ensure you followed the setup steps in order
4. Check terminal output and browser console for error messages

**Common startup checklist:**
- [ ] MySQL is running
- [ ] `.env` file exists with correct credentials
- [ ] SSL certificates generated in `backend/`
- [ ] Databases created (`login_db`, `info_db`)
- [ ] Dependencies installed (`npm install` in root and frontend)
- [ ] Backend running on https://localhost:3000
- [ ] Frontend running on http://localhost:4200

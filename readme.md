# 📚 AttendEase - Smart Library Management System

[![Node.js](https://img.shields.io/badge/Node.B](https://img.shields.io/badge/MongoDBttps://img.shields.io/badge/JWT-AuthenticationI for modern library seat booking and attendance management system with QR code integration, real-time analytics, and admin dashboard.

## 🌟 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure password hashing
- **Role-based access control** (Student/Admin)
- **Protected routes** with middleware validation
- **User profile management** with update capabilities

### 💺 Smart Seat Management
- **Dynamic seat creation** with types (Regular, Premium, Window, Corner)
- **Floor and section organization** for easy navigation
- **Real-time availability tracking** with occupancy status
- **Admin-controlled seat activation/deactivation**

### 📅 Intelligent Booking System
- **Time-slot based reservations** with conflict detection
- **Advance booking** with validation rules
- **Automatic conflict prevention** for overlapping bookings
- **Booking cancellation** with seat release
- **Duration limits** and minimum booking time enforcement

### 📱 QR Code Integration
- **Dynamic QR code generation** for each booking
- **Contactless check-in/check-out** system
- **Attendance tracking** with precise timestamps
- **Duration calculation** (planned vs actual time)
- **Mobile-friendly** QR scanning simulation

### 📊 Advanced Analytics & Reporting
- **Real-time dashboard** with occupancy metrics
- **Peak hours analysis** and usage patterns
- **Seat utilization statistics** by type and location
- **User activity reports** with study time tracking
- **CSV/JSON export** functionality for data analysis
- **Weekly/monthly trends** with visual data points

### 👨‍💼 Comprehensive Admin Panel
- **User management** with activation/deactivation
- **Live library monitoring** with current status
- **Booking oversight** with detailed filtering
- **Analytics dashboard** with key performance indicators
- **Report generation** with customizable date ranges

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/attendease-backend.git
cd attendease-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendease
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=7d
NODE_ENV=development
```

4. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

5. **Verify installation**
Visit `http://localhost:5000` - you should see "AttendEase Backend API is running"

## 📁 Project Structure

```
attendease-backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── userController.js    # User authentication & profile management
│   ├── seatController.js    # Seat CRUD operations
│   ├── bookingController.js # Booking management & validation
│   ├── attendanceController.js # QR code & check-in/out logic
│   ├── adminController.js   # Admin dashboard & analytics
│   └── reportController.js  # Report generation & export
├── middlewares/
│   ├── auth.js             # JWT authentication & authorization
│   ├── validation.js       # Input validation rules
│   └── bookingValidation.js # Booking-specific validations
├── models/
│   ├── User.js             # User schema with roles & authentication
│   ├── Seat.js             # Seat schema with types & locations
│   └── Booking.js          # Booking schema with relationships
├── routes/
│   ├── userRoutes.js       # Authentication & user endpoints
│   ├── seatRoutes.js       # Seat management endpoints
│   ├── bookingRoutes.js    # Booking system endpoints
│   ├── attendanceRoutes.js # QR code & attendance endpoints
│   ├── adminRoutes.js      # Admin dashboard endpoints
│   └── reportRoutes.js     # Report generation endpoints
├── services/
│   └── (future services)
├── utils/
│   ├── jwt.js              # JWT token utilities
│   └── qrCode.js           # QR code generation & parsing
├── app.js                  # Express app configuration
├── package.json            # Dependencies & scripts
└── README.md              # Project documentation
```

## 🔗 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/register` | Register new user | ❌ |
| POST | `/users/login` | User login | ❌ |
| GET | `/users/profile` | Get user profile | ✅ |
| PUT | `/users/profile` | Update user profile | ✅ |

### Seat Management Endpoints
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/seats` | Get all seats | ❌ | ❌ |
| GET | `/seats/:id` | Get seat by ID | ❌ | ❌ |
| POST | `/seats` | Create new seat | ✅ | ✅ |
| PUT | `/seats/:id` | Update seat | ✅ | ✅ |
| DELETE | `/seats/:id` | Delete seat | ✅ | ✅ |

### Booking System Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/bookings` | Create booking | ✅ |
| GET | `/bookings/my-bookings` | Get user's bookings | ✅ |
| GET | `/bookings/:id` | Get booking details | ✅ |
| PATCH | `/bookings/:id/cancel` | Cancel booking | ✅ |
| GET | `/bookings` | Get all bookings (Admin) | ✅ |

### QR Code & Attendance Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/attendance/generate-qr/:id` | Generate QR for booking | ✅ |
| POST | `/attendance/checkin` | Check-in with QR | ✅ |
| POST | `/attendance/checkout` | Check-out with QR | ✅ |
| GET | `/attendance/history` | Get attendance history | ✅ |

### Admin Dashboard Endpoints
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/admin/dashboard` | Dashboard statistics | ✅ | ✅ |
| GET | `/admin/analytics` | Advanced analytics | ✅ | ✅ |
| GET | `/admin/library-status` | Real-time status | ✅ | ✅ |
| GET | `/admin/users` | User management | ✅ | ✅ |
| PATCH | `/admin/users/:id/status` | Update user status | ✅ | ✅ |

### Report Generation Endpoints
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/reports/bookings` | Booking reports | ✅ | ✅ |
| GET | `/reports/users` | User activity reports | ✅ | ✅ |
| GET | `/reports/seats` | Seat utilization reports | ✅ | ✅ |

## 📊 Database Schema

### User Model
```javascript
{
  name: String,           // User's full name
  email: String,          // Unique email address
  phone: String,          // 10-digit phone number
  password: String,       // Hashed password
  role: String,           // 'student' or 'admin'
  isActive: Boolean,      // Account status
  timestamps: true        // createdAt, updatedAt
}
```

### Seat Model
```javascript
{
  seatNumber: String,     // Unique seat identifier (e.g., "A001")
  seatType: String,       // 'regular', 'premium', 'window', 'corner'
  floor: Number,          // Floor number
  section: String,        // Section identifier (e.g., "A", "B")
  isActive: Boolean,      // Seat availability for booking
  isOccupied: Boolean,    // Current occupancy status
  description: String,    // Optional seat description
  timestamps: true
}
```

### Booking Model
```javascript
{
  user: ObjectId,         // Reference to User
  seat: ObjectId,         // Reference to Seat
  startTime: Date,        // Booking start time
  endTime: Date,          // Booking end time
  status: String,         // 'active', 'checked-in', 'completed', 'cancelled', 'no-show'
  checkInTime: Date,      // Actual check-in timestamp
  checkOutTime: Date,     // Actual check-out timestamp
  actualDuration: Number, // Duration in minutes
  qrCode: String,         // Generated QR code data
  qrData: String,         // QR code JSON string
  notes: String,          // Optional booking notes
  attendanceNotes: String, // Check-out notes
  timestamps: true
}
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | ❌ |
| `MONGO_URI` | MongoDB connection string | - | ✅ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_EXPIRE` | JWT expiration time | 7d | ❌ |
| `NODE_ENV` | Environment mode | development | ❌ |

### MongoDB Setup
1. **Local MongoDB:**
   ```bash
   # Install MongoDB Community Edition
   # Start MongoDB service
   mongod --dbpath /path/to/your/db
   ```

2. **MongoDB Atlas (Cloud):**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create cluster and get connection string
   - Replace `MONGO_URI` in `.env` file

## 🧪 Testing

### API Testing with Thunder Client (VS Code)
1. Install Thunder Client extension
2. Import the provided collection (if available)
3. Set environment variables for base URL and tokens

### Sample API Calls

**Register User:**
```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "student"
}
```

**Create Booking:**
```bash
POST /api/bookings
Authorization: Bearer 
Content-Type: application/json

{
  "seat": "seat_id_here",
  "startTime": "2025-06-08T10:00:00.000Z",
  "endTime": "2025-06-08T14:00:00.000Z",
  "notes": "Study session for exams"
}
```

**Generate QR Code:**
```bash
POST /api/attendance/generate-qr/booking_id_here
Authorization: Bearer 
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup:**
   ```bash
   NODE_ENV=production
   MONGO_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   ```

2. **Build & Start:**
   ```bash
   npm install --production
   npm start
   ```

### Deployment Platforms

**Heroku:**
```bash
heroku create attendease-api
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
```

**AWS/DigitalOcean:**
- Use PM2 for process management
- Configure nginx as reverse proxy
- Set up SSL certificates
- Configure MongoDB replica set for production

## 🔒 Security Features

- **Password Hashing:** bcryptjs with salt rounds
- **JWT Authentication:** Secure token-based auth
- **Input Validation:** express-validator for all inputs
- **CORS Protection:** Configurable cross-origin requests
- **Rate Limiting:** (Recommended for production)
- **Helmet.js:** (Recommended for security headers)

## 📈 Performance Optimizations

- **Database Indexing:** Optimized queries with proper indexes
- **Pagination:** Implemented for large data sets
- **Aggregation Pipelines:** Efficient data processing
- **Connection Pooling:** MongoDB connection optimization
- **Error Handling:** Comprehensive error management

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write descriptive commit messages
- Add tests for new features
- Update documentation for API changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - Secure authentication standard
- **QRCode** - QR code generation library

## 📞 Support

- **Documentation:** [API Docs](link-to-your-docs)
- **Issues:** [GitHub Issues](https://github.com/yourusername/attendease-backend/issues)
- **Email:** your.email@example.com

---



**Built with ❤️ for modern library management**

[⭐ Star this repo](https://github.com/yourusername/attendease-backend) | [🐛 Report Bug](https://github.com/yourusername/attendease-backend/issues) | [✨ Request Feature](https://github.com/yourusername/attendease-backend/issues)


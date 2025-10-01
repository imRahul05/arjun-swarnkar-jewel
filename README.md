# Arjun Swarnkar Digital Billing & Analytics System

A comprehensive full-stack web application for managing billing, customer data, and analytics for a gold and jewelry shop. Built with React, Node.js, Express, and MongoDB with GST and BIS compliance.

## Features

### 🧾 Billing & Invoicing
- Generate GST-compliant bills with jewelry-specific fields
- PDF generation and download
- HUID (Hallmark Unique ID) tracking
- Gold purity and weight calculations
- Making charges and wastage calculations
- Multi-tax support (CGST, SGST, IGST)

### 📋 Bills Management
- View all generated bills
- Filter by status and payment status
- Search by bill number, customer details
- Update payment status
- Download bills as PDF
- Detailed bill view with all item information

### 👥 Customer Management
- Add and manage customer profiles
- GST number tracking
- Purchase history
- Search and filter customers
- Customer analytics

### 📊 Analytics & Reporting
- Sales dashboard with key metrics
- Monthly and yearly sales trends
- Tax reports (CGST, SGST, IGST)
- Customer analytics
- Payment status tracking

### 🔐 Authentication
- Secure login system
- JWT-based authentication
- Admin user management
- Session management

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Phosphor Icons** for icons
- **jsPDF** & **html2canvas** for PDF generation
- **Axios** for API communication
- **React Hook Form** for form management
- **Sonner** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for logging
- **Express Rate Limit** for API protection

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd arjun-swarnkar-billing
```

### 2. Environment Configuration

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend (backend/.env)
```env
MONGODB_URI=mongodb+srv://rahulkumar20000516:mnspass@cluster0.ar1qaru.mongodb.net/arjunBill
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production_please
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Default admin user (for seeding)
ADMIN_EMAIL=admin@arjunswarnkar.com
ADMIN_PASSWORD=admin123
```

### 3. Installation & Start

#### Option 1: Run Full Stack (Recommended)
```bash
# Install frontend dependencies
npm install

# Start both frontend and backend
npm run dev:fullstack
```

#### Option 2: Run Separately
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### 5. Login Credentials
```
Email: admin@arjunswarnkar.com
Password: admin123
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Bills
- `GET /api/bills` - Get all bills (with pagination and filters)
- `GET /api/bills/:id` - Get bill by ID
- `POST /api/bills` - Create new bill
- `PUT /api/bills/:id` - Update bill
- `PUT /api/bills/:id/payment-status` - Update payment status
- `DELETE /api/bills/:id` - Cancel bill

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Deactivate customer
- `GET /api/customers/search/:query` - Search customers

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/sales-report` - Sales reports
- `GET /api/analytics/tax-report` - Tax reports

## Database Schema

### Users Collection
- Authentication and user management
- Role-based access (admin/user)
- Encrypted passwords

### Customers Collection
- Customer information
- GST details
- Purchase history tracking

### Bills Collection
- Complete bill information
- Line items with jewelry-specific fields
- Tax calculations
- Payment tracking
- Status management

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- XSS protection with Helmet
- Environment variable protection

## GST & Compliance Features

- **GST Calculations**: Automatic CGST, SGST, and IGST calculations
- **HSN Codes**: Jewelry-specific HSN code (71131900)
- **BIS Compliance**: HUID (Hallmark Unique ID) tracking
- **Tax Reports**: Detailed tax breakdowns for compliance
- **Bill Numbering**: Sequential bill numbering with prefix

## PDF Generation

- Server-side PDF generation using jsPDF
- Professional invoice layout
- Company branding
- Detailed item breakdown
- Tax summary
- Terms and conditions

## Development

### Project Structure
```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── lib/               # Utilities and API
│   └── ...
├── backend/               # Backend source code
│   ├── models/           # MongoDB models
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth middleware
│   └── utils/            # Utilities
└── ...
```

### Available Scripts

Frontend:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

Backend:
- `npm run dev` - Start development server (nodemon)
- `npm start` - Start production server

Full Stack:
- `npm run dev:fullstack` - Start both frontend and backend

## Production Deployment

### Frontend
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables

### Backend
1. Set production environment variables
2. Deploy to your server (Heroku, DigitalOcean, etc.)
3. Ensure MongoDB connection is secure
4. Use a strong JWT secret

### Environment Variables for Production
- Use strong, unique JWT secrets
- Secure MongoDB connection string
- Configure CORS for your domain
- Set NODE_ENV=production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
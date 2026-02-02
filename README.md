# CashFlow - Personal Income/Expense Tracker

A modern full-stack web application for tracking personal income and expenses with Django REST Framework backend and React frontend. Built with authentication, real-time balance calculations, and a TailAdmin-inspired UI.

## 🏗️ Architecture Overview

### Backend (Django + DRF)
- **Framework**: Django 5.0.7 with Django REST Framework 3.15.2
- **Database**: SQLite (development), PostgreSQL ready for production
- **Authentication**: JWT (django-rest-framework-simplejwt)
- **API**: RESTful API with token-based authentication
- **CORS**: django-cors-headers for frontend integration

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS v3.4.0 with TailAdmin-inspired design
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Component-based routing with authentication guards
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
CashFlow/
├── backend/                    # Django backend
│   ├── cashflow_backend/       # Django project settings
│   │   ├── settings.py         # Main configuration
│   │   ├── urls.py            # Root URL routing
│   │   └── wsgi.py            # WSGI configuration
│   ├── tracker/                # Django app
│   │   ├── models.py          # Transaction and Category models
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # API viewsets and views
│   │   └── urls.py            # App URL routing
│   ├── manage.py              # Django management script
│   ├── requirements.txt       # Python dependencies
│   └── db.sqlite3            # SQLite database (development)
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── api/               # API layer
│   │   │   ├── index.ts       # Axios configuration with interceptors
│   │   │   ├── auth.ts        # Authentication API calls
│   │   │   ├── transactions.ts # Transaction API calls
│   │   │   └── categories.ts  # Category API calls
│   │   ├── components/        # React components
│   │   │   ├── Auth/          # Authentication components
│   │   │   │   ├── Login.tsx  # Login/Register form
│   │   │   │   └── AuthGuard.tsx # Authentication guard
│   │   │   ├── Layout/        # Layout components
│   │   │   │   ├── Sidebar.tsx # Navigation sidebar
│   │   │   │   ├── Header.tsx  # App header
│   │   │   │   └── Layout.tsx  # Main layout wrapper
│   │   │   ├── Dashboard/     # Dashboard components
│   │   │   │   ├── Dashboard.tsx # Main dashboard
│   │   │   │   └── BalanceCard.tsx # Balance display cards
│   │   │   ├── Transactions/  # Transaction components
│   │   │   │   ├── TransactionList.tsx # Transaction table
│   │   │   │   └── TransactionModal.tsx # Add/Edit modal
│   │   │   └── Categories/    # Category components
│   │   │       └── CategoryList.tsx # Category management
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts     # Authentication state management
│   │   │   ├── useTransactions.ts # Transaction state
│   │   │   └── useCategories.ts # Category state
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── index.ts       # Main type exports
│   │   ├── App.tsx            # Main App component
│   │   └── main.tsx           # Application entry point
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── vite.config.ts          # Vite configuration
│   └── tsconfig.json           # TypeScript configuration
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start development server**
   ```bash
   python manage.py runserver 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

### Access Points

- **Frontend Application**: http://localhost:5174
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

## 🔐 Authentication

### JWT Token Flow

1. **Login**: POST `/api/token/` with username/password
2. **Response**: Access token (1 hour) + Refresh token (7 days)
3. **API Calls**: Include `Authorization: Bearer <access_token>` header
4. **Token Refresh**: Automatic refresh using interceptors
5. **Logout**: Clear tokens from localStorage

### Default Admin User

- **Username**: `htevilili`
- **Password**: `admin123`

## 📊 API Endpoints

### Authentication
- `POST /api/token/` - Login (JWT tokens)
- `POST /api/token/refresh/` - Refresh access token
- `POST /api/register/` - User registration

### Transactions
- `GET /api/transactions/` - List user transactions
- `POST /api/transactions/` - Create transaction
- `PUT /api/transactions/<id>/` - Update transaction
- `DELETE /api/transactions/<id>/` - Delete transaction

### Categories
- `GET /api/categories/` - List user categories
- `POST /api/categories/` - Create category
- `PUT /api/categories/<id>/` - Update category
- `DELETE /api/categories/<id>/` - Delete category

### Balance
- `GET /api/balance/` - Get balance statistics
  ```json
  {
    "total_income": "5800.00",
    "total_expenses": "495.00",
    "balance": "5305.00",
    "monthly_income": "4500.00",
    "monthly_expenses": "2800.00"
  }
  ```

## 🗄️ Database Models

### Transaction Model
```python
class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100)
    transaction_type = models.CharField(
        max_length=10,
        choices=[('income', 'Income'), ('expense', 'Expense')]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Category Model
```python
class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
```

## 🎨 Frontend Components

### Authentication Flow
1. **AuthGuard**: Protects authenticated routes
2. **Login**: Handles login/registration forms
3. **useAuth**: Manages authentication state and tokens

### Layout System
- **Layout**: Main layout wrapper with sidebar and header
- **Sidebar**: Navigation with mobile responsiveness
- **Header**: App header with search and notifications

### Dashboard
- **BalanceCard**: Display balance statistics with gradients
- **Recent Transactions**: Quick view of latest transactions
- **Real-time Updates**: React Query for automatic data refresh

### Transaction Management
- **TransactionList**: Full CRUD table with filtering
- **TransactionModal**: Add/Edit form with validation
- **Color Coding**: Green for income, red for expenses

### Category Management
- **CategoryList**: Grid layout with CRUD operations
- **User-scoped**: Each user manages their own categories

## 🔧 Configuration

### Backend Settings (settings.py)

```python
# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5174",
]
```

### Frontend Configuration

**Vite Config (vite.config.ts)**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

**Tailwind Config (tailwind.config.js)**
```javascript
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
}
```

## 🧪 Testing

### Backend Testing
```bash
# Run tests
python manage.py test

# Create test data
python manage.py shell
```

### Frontend Testing
```bash
# Run tests (if configured)
npm test

# Type checking
npm run type-check
```

## 🚀 Deployment

### Backend Production

1. **Environment Variables**
   ```bash
   export DEBUG=False
   export SECRET_KEY='your-secret-key'
   export DATABASE_URL='postgresql://user:pass@localhost/dbname'
   ```

2. **Collect Static Files**
   ```bash
   python manage.py collectstatic
   ```

3. **Database Migrations**
   ```bash
   python manage.py migrate
   ```

### Frontend Production

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Serve Static Files**
   ```bash
   # Use nginx, Apache, or serve
   npm install -g serve
   serve -s dist
   ```

## 🔒 Security Features

- **JWT Authentication**: Token-based authentication with refresh tokens
- **CORS Protection**: Configured for frontend domains only
- **User Isolation**: Each user sees only their own data
- **Input Validation**: DRF serializers validate all inputs
- **SQL Injection Protection**: Django ORM prevents SQL injection
- **CSRF Protection**: Enabled for session-based views

## 📈 Performance Optimizations

### Backend
- **Database Indexing**: Optimized queries for user-specific data
- **Pagination**: Large datasets use pagination
- **Query Optimization**: Efficient database queries

### Frontend
- **React Query**: Intelligent caching and background updates
- **Code Splitting**: Lazy loading of components
- **Optimistic Updates**: Immediate UI updates with rollback on error
- **Debounced API Calls**: Prevent excessive API requests

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ALLOWED_ORIGINS in settings.py
   - Ensure frontend URL is included

2. **Authentication Not Working**
   - Check browser console for token storage
   - Verify JWT configuration
   - Check localStorage for access_token

3. **API 401 Errors**
   - Ensure tokens are included in headers
   - Check token expiration
   - Verify user is authenticated

4. **Database Errors**
   - Run migrations: `python manage.py migrate`
   - Check database file permissions
   - Verify database configuration

### Debug Mode

**Backend**
```bash
# Enable debug logging
export DEBUG=True

# Check database
python manage.py dbshell
```

**Frontend**
```bash
# Check network requests in browser dev tools
# Console logging enabled in useAuth hook
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **TailAdmin**: Design inspiration for the UI
- **Django REST Framework**: Excellent API framework
- **React Query**: Powerful state management
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Beautiful icon set

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ using Django + React + Tailwind CSS**

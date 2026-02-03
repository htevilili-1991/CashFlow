# CashFlow - Comprehensive Personal Finance Management System

A modern full-stack web application for comprehensive personal finance management with Django REST Framework backend and React frontend. Built with envelope budgeting, savings goals, recurring transactions, advanced reporting, and a TailAdmin-inspired UI.

## � Key Features

### 💰 Core Financial Management
- **Transaction Tracking**: Complete CRUD operations for income and expenses
- **Category Management**: Separate categories for income and expenses
- **Real-time Balance**: Automatic balance calculations and updates
- **Transaction History**: Complete audit trail with date-based filtering

### 📊 Envelope Budgeting System
- **Budget Allocation**: Allocate funds to specific spending categories
- **Envelope Tracking**: Monitor budgeted vs actual spending
- **Overspending Alerts**: Visual indicators when approaching or exceeding budget
- **Monthly Rollover**: Carry over underspent amounts to next month
- **Budget vs Actual**: Real-time comparison of planned vs actual spending

### 🎯 Savings Goals Management
- **Goal Creation**: Set specific savings targets with deadlines
- **Progress Tracking**: Visual progress bars and percentage completion
- **Contribution Management**: Add contributions with automatic transaction creation
- **Envelope Integration**: Goals validated against Savings envelope allocation
- **Goal Completion**: Automatic completion detection and celebration

### � Recurring Transactions
- **Automated Scheduling**: Set up recurring income and expenses
- **Multiple Frequencies**: Daily, weekly, biweekly, monthly, quarterly, yearly
- **Smart Date Calculation**: Automatic next occurrence calculation
- **Overdue Processing**: Bulk processing of overdue transactions
- **Skip Functionality**: Skip individual occurrences when needed
- **Status Management**: Active, paused, and completed states

### 📈 Advanced Reports & Insights
- **Monthly Reports**: Detailed monthly financial analysis with charts
- **Yearly Reports**: Annual financial trends and category breakdowns
- **Comparison Reports**: Period-over-period analysis and insights
- **Interactive Charts**: Pie charts, line charts, and bar charts using Recharts
- **Data Export**: Export to CSV and JSON formats for tax and analysis
- **Trend Analysis**: Category spending trends over time

## 📸 Application Screenshots

### Authentication Pages

#### Login/Register Page
<!-- Screenshot placeholder: Login/Register form with username, password fields, and toggle between login/register -->

### Main Application Pages

#### Dashboard
<!-- Screenshot placeholder: Dashboard with balance cards, recent transactions, and financial overview -->

#### Transactions Page
<!-- Screenshot placeholder: Transaction list with filters, search, add/edit functionality -->

#### Categories Management
<!-- Screenshot placeholder: Category grid with CRUD operations for income and expense categories -->

#### Envelopes Budgeting
<!-- Screenshot placeholder: Envelope management showing budgeted amounts, spent amounts, and remaining balances -->

#### Savings Goals
<!-- Screenshot placeholder: Savings goals overview with progress bars and goal management -->

#### Recurring Transactions
<!-- Screenshot placeholder: Recurring transactions list with status indicators and management options -->

#### Reports & Insights
<!-- Screenshot placeholder: Reports dashboard with monthly, yearly, and comparison reports -->

#### Settings
<!-- Screenshot placeholder: Settings page with user preferences and configuration options -->

### Modals and Interactive Components

#### Transaction Modal
<!-- Screenshot placeholder: Add/Edit transaction modal with form fields for amount, description, category, date -->

#### Category Modal
<!-- Screenshot placeholder: Add/Edit category modal with name and transaction type selection -->

#### Envelope Modal
<!-- Screenshot placeholder: Add/Edit envelope modal with budget amount and category selection -->

#### Savings Goal Modal
<!-- Screenshot placeholder: Create/Edit savings goal modal with validation against Savings envelope -->

#### Contribution Modal
<!-- Screenshot placeholder: Contribute to goal modal with amount validation and available balance display -->

#### Recurring Transaction Modal
<!-- Screenshot placeholder: Create/Edit recurring transaction modal with frequency options and scheduling -->

#### Export Modal
<!-- Screenshot placeholder: Export data modal with format selection (CSV/JSON) and date range options -->

### Charts and Visualizations

#### Monthly Report Charts
<!-- Screenshot placeholder: Monthly report with pie chart for category breakdown and line chart for daily trends -->

#### Yearly Report Charts
<!-- Screenshot placeholder: Yearly report with monthly trend line chart and top categories bar chart -->

#### Comparison Report Charts
<!-- Screenshot placeholder: Comparison report with period-over-period comparison bar charts -->

## 🎨 Frontend Components

### Authentication Flow
1. **AuthGuard**: Protects authenticated routes
2. **Login**: Handles login/registration forms
3. **useAuth**: Manages authentication state and tokens

### Layout System
- **Layout**: Main layout wrapper with sidebar and header
- **Sidebar**: Navigation with mobile responsiveness and all menu items
- **Header**: App header with user info and navigation

### Dashboard
- **BalanceCard**: Display balance statistics with gradients
- **Recent Transactions**: Quick view of latest transactions
- **Real-time Updates**: React Query for automatic data refresh
- **Financial Overview**: Complete financial snapshot

### Transaction Management
- **TransactionList**: Full CRUD table with filtering and search
- **TransactionModal**: Add/Edit form with validation and category selection
- **Color Coding**: Green for income, red for expenses
- **Date Filtering**: Flexible date range filtering

### Category Management
- **CategoryList**: Grid layout with CRUD operations
- **Type Separation**: Separate income and expense categories
- **User-scoped**: Each user manages their own categories

### Envelope Budgeting
- **Envelope Management**: Complete envelope CRUD operations
- **Budget Tracking**: Real-time budget vs actual spending
- **Visual Indicators**: Color-coded status indicators
- **Monthly Rollover**: Automated monthly envelope processing

### Savings Goals
- **Goal Management**: Complete CRUD for savings goals
- **Progress Tracking**: Visual progress bars and statistics
- **Contribution System**: Integrated contribution management
- **Envelope Validation**: Goals validated against Savings envelope

### Recurring Transactions
- **Transaction Management**: Full CRUD for recurring transactions
- **Frequency Options**: Multiple scheduling frequencies
- **Status Management**: Active, paused, and completed states
- **Bulk Processing**: Process multiple overdue transactions

### Reports & Analytics
- **Interactive Charts**: Pie charts, line charts, bar charts
- **Data Export**: CSV and JSON export capabilities
- **Trend Analysis**: Category spending trends over time
- **Period Comparison**: Month-over-month and year-over-year analysis

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

### Envelopes
- `GET /api/envelopes/` - List user envelopes
- `POST /api/envelopes/` - Create envelope
- `PUT /api/envelopes/<id>/` - Update envelope
- `DELETE /api/envelopes/<id>/` - Delete envelope
- `GET /api/balance/` - Get balance statistics
- `GET /api/income/` - Get income allocation data
- `POST /api/monthly-rollover/` - Perform monthly envelope rollover

### Savings Goals
- `GET /api/savings-goals/` - List savings goals
- `POST /api/savings-goals/` - Create savings goal
- `PUT /api/savings-goals/<id>/` - Update savings goal
- `DELETE /api/savings-goals/<id>/` - Delete savings goal
- `POST /api/savings-goals/<id>/contribute/` - Contribute to goal

### Recurring Transactions
- `GET /api/recurring-transactions/` - List recurring transactions
- `POST /api/recurring-transactions/` - Create recurring transaction
- `PUT /api/recurring-transactions/<id>/` - Update recurring transaction
- `DELETE /api/recurring-transactions/<id>/` - Delete recurring transaction
- `POST /api/recurring-transactions/<id>/create-transaction/` - Create transaction now
- `POST /api/recurring-transactions/<id>/skip-next/` - Skip next occurrence
- `GET /api/recurring-transactions/upcoming/` - Get upcoming transactions
- `GET /api/recurring-transactions/overdue/` - Get overdue transactions
- `POST /api/recurring-transactions/process-overdue/` - Process all overdue

### Reports & Analytics
- `GET /api/reports/monthly/` - Monthly financial report
- `GET /api/reports/yearly/` - Yearly financial report
- `GET /api/reports/comparison/` - Period comparison report
- `GET /api/export/` - Export data (CSV/JSON)

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

# 🏥 Pharmacovigilance Iraq Platform

A comprehensive web platform for drug safety monitoring and adverse event reporting in Iraq, built with Flask and modern web technologies.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- PostgreSQL database (recommended) or SQLite for development
- Google Sheets API credentials (optional, for report storage)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd pharmacovigalinc-new-blacbox-main
   ```

2. **Run the automated installation:**
   ```bash
   python install_dependencies.py
   ```

3. **Configure environment variables:**
   ```bash
   # Edit the .env file with your settings
   cp .env.example .env
   # Edit .env with your actual configuration
   ```

4. **Start the application:**
   ```bash
   python app.py
   ```

5. **Access the platform:**
   - Open your browser to `http://localhost:5000`
   - Default admin login: `admin` / `admin123`

## 🔧 Manual Installation

If the automated installer doesn't work:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Start the application
python app.py
```

## 📋 Configuration

### Required Environment Variables

```env
# Basic Configuration
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
ADMIN_PASSWORD=secure-admin-password

# Database
DATABASE_URL=postgresql://username:password@localhost/pharmacovigilance

# Google Sheets (Optional - for report storage)
GOOGLE_SHEET_ID=your-google-sheet-id-here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
```

### Database Setup

**PostgreSQL (Recommended):**
```sql
CREATE DATABASE pharmacovigilance;
CREATE USER pharmacovigilance_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pharmacovigilance TO pharmacovigilance_user;
```

**SQLite (Development):**
The application will automatically create a SQLite database if PostgreSQL is not configured.

## 🏗️ Architecture

### Backend Components
- **Flask Application** (`app.py`) - Main application entry point
- **Authentication** (`auth.py`) - User management and security
- **Database Models** (`models.py`) - Data structure definitions
- **API Routes** (`routes_hybrid.py`) - RESTful API endpoints
- **Google Sheets Integration** (`google_sheets_service.py`) - Report storage

### Frontend Components
- **Static Files** (`static/`) - HTML, CSS, JavaScript
- **Responsive Design** - Mobile-first approach
- **Arabic RTL Support** - Right-to-left text direction
- **Modern UI** - Clean, professional interface

## 🔐 Security Features

- **User Authentication** - Secure login system
- **Role-based Access Control** - Admin, reviewer, and user roles
- **Session Management** - Secure session handling
- **Input Validation** - Form data sanitization
- **CSRF Protection** - Cross-site request forgery prevention
- **Security Headers** - HTTP security headers

## 📊 Features

### Core Functionality
- ✅ **Adverse Drug Reaction Reporting** - Comprehensive reporting system
- ✅ **Intruder Reporting** - Report unauthorized pharmacy personnel
- ✅ **User Management** - Admin panel for user administration
- ✅ **Dashboard Analytics** - Real-time statistics and insights
- ✅ **Multi-language Support** - Arabic, English, Kurdish
- ✅ **Mobile Responsive** - Works on all devices

### Data Management
- ✅ **PostgreSQL Integration** - Robust database storage
- ✅ **Google Sheets Backup** - Cloud-based report storage
- ✅ **Data Export** - CSV/Excel export functionality
- ✅ **Search and Filtering** - Advanced data filtering
- ✅ **Audit Logging** - Complete activity tracking

## 🚀 Deployment

### Local Development
```bash
export FLASK_ENV=development
python app.py
```

### Production Deployment

**Using Gunicorn:**
```bash
gunicorn --bind 0.0.0.0:8000 app:app
```

**Using Docker:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

**Render.com Deployment:**
The project includes `render.yaml` for easy deployment to Render.com.

## 🔍 Troubleshooting

### Common Issues

**1. ModuleNotFoundError: No module named 'flask'**
```bash
pip install -r requirements.txt
```

**2. Database connection errors**
- Check your DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database credentials

**3. Google Sheets integration not working**
- Verify GOOGLE_SHEET_ID is correct
- Check service account credentials
- Ensure proper permissions on the Google Sheet

**4. CSS/JavaScript not loading**
- Clear browser cache
- Check static file paths
- Verify Flask static folder configuration

### Debug Mode
```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
```

## 📁 Project Structure

```
pharmacovigalinc-new-blacbox-main/
├── app.py                      # Main Flask application
├── main.py                     # Alternative entry point
├── auth.py                     # Authentication system
├── models.py                   # Database models
├── routes_hybrid.py            # API routes
├── config.py                   # Configuration settings
├── extensions.py               # Flask extensions
├── google_sheets_service.py    # Google Sheets integration
├── seed_data_hybrid.py         # Database seeding
├── requirements.txt            # Python dependencies
├── install_dependencies.py     # Automated installer
├── .env.example               # Environment template
├── Procfile                   # Heroku deployment
├── render.yaml                # Render.com deployment
├── runtime.txt                # Python version
└── static/                    # Frontend assets
    ├── css/
    │   └── style.css          # Main stylesheet
    ├── js/
    │   ├── main.js            # Core JavaScript
    │   ├── auth.js            # Authentication JS
    │   └── dashboard.js       # Dashboard functionality
    ├── index.html             # Homepage
    ├── login.html             # Login page
    ├── dashboard.html         # Admin dashboard
    ├── info.html              # Information page
    ├── report.html            # Reporting forms
    └── faq.html               # FAQ page
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- 📧 Email: info@pharmacovigilance.iq
- 📞 Phone: +964 1 234 5678
- 🌐 Website: https://pharmacovigilance.iq

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Initial release
- ✅ Core reporting functionality
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Google Sheets integration
- ✅ Multi-language support

---

**Built with ❤️ for the Iraqi Ministry of Health**

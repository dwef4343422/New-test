# 🚀 Render.com Deployment Guide for Pharmacovigilance Iraq Platform

## ✅ Pre-Deployment Checklist

Your application has been **fully debugged and optimized** for Render.com deployment:

- ✅ All Python import errors fixed
- ✅ Database models corrected
- ✅ HTML duplications removed
- ✅ CSS styling completed
- ✅ Dependencies installed successfully
- ✅ Application tested locally (runs on http://127.0.0.1:5000)
- ✅ Admin user created automatically
- ✅ Database seeding working
- ✅ Render.yaml optimized

## 🔧 Render.com Deployment Steps

### 1. **Connect Your Repository**
```bash
# Push your code to GitHub/GitLab
git add .
git commit -m "Ready for Render.com deployment"
git push origin main
```

### 2. **Create New Web Service on Render.com**
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect your GitHub/GitLab repository
- Select this project folder

### 3. **Render.com Will Auto-Configure Using render.yaml**
Your `render.yaml` is already optimized with:
```yaml
services:
  - type: web
    name: pharmacovigilance-iraq
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn --bind 0.0.0.0:$PORT app:app --timeout 120 --workers 2
    healthCheckPath: /health
    autoDeploy: true
```

### 4. **Environment Variables (Auto-Generated)**
Render will automatically create:
- `SECRET_KEY` - Auto-generated secure key
- `ADMIN_PASSWORD` - Auto-generated admin password
- `DATABASE_URL` - PostgreSQL connection string
- `FLASK_ENV=production`

### 5. **Optional: Google Sheets Integration**
If you want report storage in Google Sheets, add these environment variables in Render dashboard:
```
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----"
```

## 🎯 Deployment Process

### What Happens During Deployment:
1. **Build Phase**: `pip install -r requirements.txt`
2. **Database Setup**: PostgreSQL database created automatically
3. **App Initialization**: 
   - Database tables created
   - Admin user created with auto-generated password
   - Sample data seeded
4. **Health Check**: `/health` endpoint verified
5. **Go Live**: Your app is accessible via Render URL

### Expected Deployment Time: **3-5 minutes**

## 🔐 Post-Deployment Access

### **Your Live Website**
- **URL**: `https://pharmacovigilance-iraq.onrender.com` (or similar)
- **Admin Login**: `admin` / `[check Render logs for auto-generated password]`

### **Find Admin Password**
1. Go to Render Dashboard → Your Service → Logs
2. Look for: `Default admin user created`
3. Or check Environment Variables for `ADMIN_PASSWORD`

## 🧪 Testing Your Deployed Site

### **Core Functions to Test:**
1. **Homepage** - Arabic RTL layout, responsive design
2. **Login System** - Admin authentication
3. **Dashboard** - Statistics and data management
4. **Reporting Forms** - Adverse reactions and intruder reports
5. **API Endpoints** - Data retrieval and submission
6. **Database** - PostgreSQL data persistence
7. **Mobile Responsiveness** - All screen sizes

### **Health Check Endpoint**
- `https://your-app.onrender.com/health`
- Should return: `{"status": "healthy", "service": "pharmacovigilance-iraq-hybrid"}`

## 🔍 Troubleshooting

### **Common Issues & Solutions:**

**1. Build Fails**
```bash
# Check requirements.txt is present
# Verify Python version in runtime.txt
```

**2. Database Connection Issues**
```bash
# Render auto-creates PostgreSQL
# Check DATABASE_URL in environment variables
```

**3. Static Files Not Loading**
```bash
# All static files are in /static/ folder
# Flask configured to serve from static folder
```

**4. Google Sheets Not Working**
```bash
# This is optional - app works without it
# Reports stored in PostgreSQL instead
```

## 📊 Performance Optimization

Your app is configured for optimal Render.com performance:
- **Gunicorn** with 2 workers
- **120-second timeout** for long requests
- **Health checks** for reliability
- **Auto-deploy** on code changes
- **PostgreSQL** for data persistence

## 🔄 Continuous Deployment

With `autoDeploy: true`, your app will automatically redeploy when you push changes to your repository.

## 🆘 Support

If you encounter issues:
1. Check Render Dashboard → Logs
2. Verify environment variables
3. Test health endpoint
4. Review this deployment guide

---

**Your Pharmacovigilance Iraq Platform is now ready for production deployment on Render.com! 🎉**
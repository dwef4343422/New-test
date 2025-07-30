# 🚀 Deployment Checklist for Pharmacovigilance Iraq

## ✅ Pre-Deployment Checklist

### 1. Files Ready for GitHub Upload
- [ ] `app.py` - Main application entry point
- [ ] `auth.py` - Authentication system
- [ ] `config.py` - Configuration settings
- [ ] `enhanced_routes.py` - Enhanced API endpoints
- [ ] `extensions.py` - Flask extensions
- [ ] `models.py` - Database models
- [ ] `routes.py` - Basic API routes
- [ ] `seed_data.py` - Database seeding
- [ ] `requirements.txt` - Python dependencies
- [ ] `runtime.txt` - Python version
- [ ] `Procfile` - Render deployment config
- [ ] `render.yaml` - Render service config
- [ ] `README.md` - Documentation
- [ ] `.gitignore` - Git ignore rules
- [ ] `static/` folder - All HTML, CSS, JS files

### 2. Files to EXCLUDE from GitHub
- [ ] Verify `venv/` folder is NOT uploaded
- [ ] Verify `__pycache__/` folders are NOT uploaded
- [ ] Verify `instance/` folder is NOT uploaded
- [ ] Verify `.env` file is NOT uploaded
- [ ] Verify `*.backup` files are NOT uploaded
- [ ] Verify `src/` folder is NOT uploaded (if using main structure)

### 3. Configuration Verification
- [ ] `requirements.txt` includes all dependencies
- [ ] `runtime.txt` specifies Python 3.11
- [ ] `Procfile` uses gunicorn correctly
- [ ] `render.yaml` has correct service configuration
- [ ] All sensitive data removed from code

## 🌐 GitHub Upload Steps

```bash
# 1. Initialize git repository
git init

# 2. Add all files (respecting .gitignore)
git add .

# 3. Check what will be committed
git status

# 4. Commit changes
git commit -m "Initial commit: Pharmacovigilance Iraq Platform"

# 5. Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/pharmacovigilance-iraq.git

# 6. Push to GitHub
git push -u origin main
```

## 🚀 Render.com Deployment Steps

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Select your GitHub repository
3. Configure settings:
   - **Name**: `pharmacovigilance-iraq`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`

### Step 3: Set Environment Variables
Add these environment variables in Render dashboard:
- `FLASK_ENV` = `production`
- `SECRET_KEY` = `your-super-secret-key-here` (generate a strong one)
- `ADMIN_PASSWORD` = `your-secure-admin-password`

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Check logs for any errors

### Step 5: Verify Deployment
- [ ] Application loads at provided URL
- [ ] Health check endpoint works: `/health`
- [ ] Database tables created automatically
- [ ] Sample data seeded successfully
- [ ] Admin login works
- [ ] Forms submit correctly
- [ ] All pages load without errors

## 🔧 Post-Deployment Tasks

### 1. Test Core Functionality
- [ ] Submit adverse reaction report
- [ ] Submit intruder report
- [ ] View FAQs page
- [ ] View drug alerts
- [ ] Admin dashboard access
- [ ] User management (admin only)

### 2. Security Verification
- [ ] HTTPS enabled (automatic on Render)
- [ ] Admin password changed from default
- [ ] No sensitive data exposed in logs
- [ ] CORS configured correctly

### 3. Performance Check
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] Static files loading correctly
- [ ] Mobile responsiveness working

## 🐛 Common Issues & Solutions

### Issue: Build Failed
**Solution**: Check `requirements.txt` for typos or incompatible versions

### Issue: Application Won't Start
**Solution**: Verify `Procfile` and `app.py` are correct

### Issue: Database Connection Error
**Solution**: Check if PostgreSQL database is created in Render

### Issue: Static Files Not Loading
**Solution**: Verify `static/` folder structure and file paths

### Issue: 500 Internal Server Error
**Solution**: Check Render logs for detailed error messages

## 📞 Support Resources

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Flask Documentation**: [flask.palletsprojects.com](https://flask.palletsprojects.com)
- **GitHub Help**: [docs.github.com](https://docs.github.com)

---

**✅ Once all items are checked, your application is ready for production!**

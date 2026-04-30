# Railway Deployment Guide

## 🚀 Deployment Setup for Railway

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected to Railway
- MongoDB Atlas account (cloud MongoDB)

---

## 📝 Environment Variables

Set these in Railway's environment variables dashboard:

```env
# Port (Railway assigns this automatically, but define it for clarity)
PORT=5000

# MongoDB Connection (Use MongoDB Atlas cloud)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# JWT Secret (Use a strong random string)
JWT_SECRET=your_very_secure_random_string_min_32_chars

# Node Environment
NODE_ENV=production
```

### Getting MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string from "Connect" button
4. Replace `<username>` and `<password>` with your credentials
5. Use this as `MONGO_URI`

---

## 🔧 Build & Start Commands

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

Ensure `server/package.json` has:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## ✅ Deployment Checklist

- [ ] `NODE_ENV=production` set in Railway
- [ ] `MONGO_URI` uses MongoDB Atlas (not localhost)
- [ ] `JWT_SECRET` is a strong random string
- [ ] `PORT` environment variable is set
- [ ] Build command succeeds without errors
- [ ] Start command specified correctly
- [ ] Application responds to health check: `/api/health`
- [ ] Frontend built and included in `client/dist`

---

## 🧪 Testing Deployment

1. **Health Check**
   ```
   GET https://your-app.up.railway.app/api/health
   ```
   Should return:
   ```json
   {
     "success": true,
     "message": "API is running",
     "timestamp": "2024-01-01T12:00:00.000Z",
     "environment": "production"
   }
   ```

2. **Root Endpoint**
   ```
   GET https://your-app.up.railway.app/
   ```
   Should return: `TaskFlow API is running`

3. **Register User**
   ```bash
   curl -X POST https://your-app.up.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

---

## 🐛 Troubleshooting

### Error: "Application failed to respond"

**Causes:**
- Database not connecting
- Port not configured correctly
- Environment variables missing

**Solutions:**
1. Check Railway logs: `railway logs`
2. Verify all environment variables are set
3. Test with health endpoint: `/api/health`
4. Check MongoDB connection string is valid

### Error: "ECONNREFUSED" or "Connection Timeout"

**Causes:**
- Using localhost MongoDB instead of cloud
- MongoDB Atlas IP whitelist not configured
- Network issues

**Solutions:**
1. Use MongoDB Atlas cloud connection
2. Whitelist Railway IP in MongoDB Atlas
3. Add connection timeout: `?serverSelectionTimeoutMS=5000`

### Frontend Not Loading

**Causes:**
- `client/dist` folder not built
- Build script didn't run
- Static files not served in production

**Solutions:**
1. Run `npm run build` locally before pushing
2. Ensure build script: `"build": "vite build"`
3. Verify `NODE_ENV=production` is set

---

## 📚 Key Server Changes

### Non-Blocking Server Start
- Server starts immediately on port 5000
- Database connection happens in background
- Server responds to requests even if DB is down
- Health check endpoint available immediately

### Enhanced Logging
- Clear startup messages with timestamps
- Environment information logged
- Connection status clearly shown
- Error logs include context

### Graceful Shutdown
- Handles `SIGTERM` signal from Railway
- Closes connections properly
- Prevents orphaned processes

### Production-Ready Error Handling
- Detailed error logs in development
- Sanitized error responses in production
- No stack traces exposed to clients
- Proper HTTP status codes

---

## 🔐 Security Notes

1. **Never commit** `.env` file to Git
2. **Use strong JWT_SECRET** (min 32 characters)
3. **Enable MongoDB IP whitelist** in Atlas
4. **Use HTTPS only** (Railway provides this)
5. **Update dependencies** regularly
6. **Monitor logs** for suspicious activity

---

## 📊 Monitoring

### Railway Dashboard
- View real-time logs
- Monitor resource usage
- Check deployment history
- Set up alerts

### Application Monitoring
- Track `/api/health` endpoint
- Monitor database connection status
- Log API response times
- Track error rates

---

## 🚀 Deployment Steps

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "fix: production deployment fixes"
   git push origin main
   ```

2. **Railway auto-deploys** on push (if connected)

3. **Monitor deployment:**
   - Watch Railway logs for errors
   - Test health endpoint
   - Verify database connection

4. **If issues occur:**
   - Check Railway logs
   - Verify environment variables
   - Test locally with `NODE_ENV=production`

---

## 📞 Support Resources

- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Express.js Docs: https://expressjs.com
- Node.js Best Practices: https://nodejs.org/en/docs/guides/nodejs-performance/

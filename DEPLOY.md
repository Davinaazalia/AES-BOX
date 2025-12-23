# 🚀 Deployment Guide - AES BOX

## Deploy ke Render.com (Recommended)

### Persiapan (5 menit)

1. **Buka Render.com**
   - Daftar gratis di [render.com](https://render.com)
   - Login dengan GitHub

2. **Siapkan Environment Variables**
   - Copy `.env.example` untuk reference
   - Generate SECRET_KEY (min 32 char random string):
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

### Deploy Steps (3 menit)

1. **Di Render Dashboard:**
   - Klik `+ New` → `Web Service`
   - Pilih GitHub repo: `AES-BOX`
   - Settings:
     - **Name**: aes-box (atau nama lain)
     - **Environment**: Python 3
     - **Build Command**: `pip install -r backend/requirements.txt`
     - **Start Command**: `gunicorn app_root:app`
     - **Runtime**: Python 3.10

2. **Environment Variables (di Render):**
   - Klik `Environment` tab
   - Add:
     ```
     FLASK_ENV=production
     FLASK_DEBUG=False
     SECRET_KEY=<your_generated_secret_key>
     ```

3. **Deploy!**
   - Klik `Create Web Service`
   - Wait 2-3 min untuk build
   - Get URL: `https://aes-box-xxxx.onrender.com`

---

## Deploy ke Railway.app (Alternatif)

1. **Buka railway.app**
   - Login dengan GitHub
   - Create new project
   - Connect GitHub repo

2. **Setup:**
   ```bash
   railway link
   railway env
   ```

3. **Add Env Vars:**
   ```
   FLASK_ENV=production
   SECRET_KEY=<your_key>
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

---

## Deploy ke PythonAnywhere (Manual)

1. Buka pythonanywhere.com (gratis tier)
2. Upload code via Web UI
3. Setup WSGI config
4. Restart app

---

## Deploy ke Docker + DigitalOcean

```bash
# Build Docker image
docker build -t aes-box:latest .

# Run locally
docker run -p 5000:5000 aes-box:latest

# Push to DigitalOcean Registry (jika punya akun)
docker tag aes-box:latest registry.digitalocean.com/aes-box/aes-box:latest
docker push registry.digitalocean.com/aes-box/aes-box:latest
```

---

## Production Checklist

- ✅ `Procfile` sudah ada
- ✅ `requirements.txt` dengan version pinned
- ✅ `SECRET_KEY` di environment variable (bukan hardcoded)
- ✅ `DEBUG=False` di production
- ✅ `.gitignore` exclude `__pycache__`, `.env`, `outputs/`
- ✅ `gunicorn` di requirements.txt

---

## Custom Domain (Optional)

**Render.com:**
1. Settings → Custom Domain
2. Add domain name
3. Update DNS CNAME records (provider: GoDaddy, Namecheap, etc)

**Railway:**
1. Project Settings → Custom Domain
2. Configure DNS

---

## Monitoring & Logs

**Render.com:**
- Logs tab: real-time application logs
- Metrics tab: CPU, RAM usage
- Email alerts untuk crashes

**Railway:**
- Deployments history
- Real-time logs view

---

## Troubleshooting

| Error | Solusi |
|-------|--------|
| "ModuleNotFoundError: No module named 'X'" | Check `requirements.txt`, pip install missing packages |
| "Port already in use" | Render auto-assigns ports, usually not issue |
| "Build failed" | Check logs, verify Python 3.8+ |
| "Application crashed" | Check SECRET_KEY set, FLASK_ENV=production |
| "CORS errors" | Check Flask-CORS imported, CORS(app) initialized |

---

## Cost Estimation

| Platform | Cost | Notes |
|----------|------|-------|
| **Render.com** | Free tier | 0.50/month after free tier |
| **Railway.app** | Free tier | $5 credit/month for paid tier |
| **PythonAnywhere** | Free tier | £4.99/month for paid |
| **DigitalOcean** | $4+/month | Droplet minimum |

---

## Post-Deployment

1. **Test endpoints:**
   ```bash
   curl https://aes-box-xxxx.onrender.com/aes
   ```

2. **Monitor logs** untuk errors

3. **Setup automatic backups** jika ada database

4. **Enable HTTPS** (Render auto-includes)

---

## Update Code

**After code changes:**

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render/Railway auto-redeploy on push!

---

**Dokumentasi resmi:**
- Render: https://render.com/docs
- Railway: https://docs.railway.app
- PythonAnywhere: https://help.pythonanywhere.com

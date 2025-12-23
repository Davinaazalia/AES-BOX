# 🚀 Deployment Guide - AES BOX

### 🎯 TL;DR - GRATIS Terbaik
**Render.com** atau **Railway.app** - kedua punya free tier yang lumayan!

---

## 🆓 OPSI GRATIS

### 1. **Render.com** (Recommended - Gratis)
- ✅ Free tier dengan 750 jam/bulan (lumayan!)
- ✅ Auto-deploy dari GitHub
- ✅ HTTPS included
- ✅ Minimal downtime
- **Cost**: Gratis (setelah free hours habis: $0.50/month)

### 2. **Railway.app** (Gratis + $5 Credit)
- ✅ Free tier dengan $5 credit/bulan
- ✅ Auto-deploy GitHub
- ✅ Postgres included
- **Cost**: Gratis dengan kredit, bayar setelah habis

### 3. **PythonAnywhere** (Gratis)
- ✅ Truly free tier
- ✅ Simple setup
- ✅ Cocok untuk beginner
- ❌ Fitur limited
- **Cost**: Gratis, upgrade £4.99/month

### 4. **Replit** (Gratis)
- ✅ Super simple setup
- ✅ No credit card needed
- ✅ Great for learning
- ❌ Performa lebih lambat
- **Cost**: Gratis, upgrade $7/month

### 5. **Oracle Cloud Always Free** (Truly Free!)
- ✅ **Permanently free** (bukan trial!)
- ✅ 2 x ARM CPU + 12 GB RAM
- ✅ 100 GB storage
- ❌ Setup lebih kompleks
- **Cost**: 100% gratis selamanya

### 6. **AWS Free Tier** (Gratis 12 bulan)
- ✅ t3.micro EC2 instance gratis 12 bulan
- ✅ Powerful
- ❌ Perlu kartu kredit
- ❌ Setup kompleks
- **Cost**: Gratis 12 bulan pertama

### 7. **Google Cloud Free Tier** (Gratis 12 bulan)
- ✅ f1-micro instance gratis 12 bulan
- ✅ Bagus untuk learning
- **Cost**: Gratis 12 bulan pertama

---

## Render.com

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

---

## Deploy ke Oracle Cloud Always Free (GRATIS SELAMANYA!)

Oracle Cloud paling bagus karena **100% gratis selamanya** (bukan trial)!

### Apa yang Gratis?
- 2x ARM CPU
- 12 GB RAM  
- 100 GB storage
- Unlimited bandwidth
- **Selamanya!** (tidak perlu bayar)

### Setup Steps

1. **Daftar Oracle Cloud** (no credit card needed)
   - https://www.oracle.com/cloud/free/

2. **Buat Compute Instance**
   - Pilih Ubuntu 22.04 LTS
   - Shape: Ampere (ARM) - gratis
   - SSH key setup

3. **SSH ke Instance**
   ```bash
   ssh -i your-key.key ubuntu@instance_ip
   ```

4. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install -y python3 python3-pip git
   cd ~
   git clone https://github.com/Davinaazalia/AES-BOX.git
   cd AES-BOX
   pip3 install -r backend/requirements.txt
   ```

5. **Jalankan App**
   ```bash
   gunicorn app_root:app --bind 0.0.0.0:5000
   ```

6. **Setup Reverse Proxy (Nginx)**
   ```bash
   sudo apt install -y nginx
   sudo systemctl start nginx
   ```
   
   Create `/etc/nginx/sites-available/aes-box`:
   ```nginx
   server {
       listen 80;
       server_name your_instance_ip;
       
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   
   Enable:
   ```bash
   sudo ln -s /etc/nginx/sites-available/aes-box /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup Systemd Service (Auto-start)**
   ```bash
   sudo nano /etc/systemd/system/aes-box.service
   ```
   
   Isi:
   ```ini
   [Unit]
   Description=AES-BOX Application
   After=network.target
   
   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/AES-BOX
   ExecStart=/usr/bin/python3 -m gunicorn app_root:app --bind 0.0.0.0:5000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   Enable:
   ```bash
   sudo systemctl enable aes-box
   sudo systemctl start aes-box
   ```

8. **Setup Domain (Optional)**
   - Beli domain di Namecheap/GoDaddy
   - Point DNS ke instance IP
   - Setup SSL dengan Let's Encrypt:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

**Done!** Aplikasi berjalan gratis selamanya di Oracle Cloud! 🎉

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

## 💰 Cost Comparison (Gratis Options)

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Render.com** ⭐ | 750 hrs/month | $0.50+/month | Production apps |
| **Railway.app** | $5 credit/month | Bayar setelah habis | Dev/Testing |
| **PythonAnywhere** | Limited features | £4.99+/month | Beginner-friendly |
| **Replit** | Basic | $7/month | Learning/Hobby |
| **Oracle Cloud** 🔥 | **Gratis forever!** | - | Long-term free |
| **AWS** | 12 months free | Bayar setelah | Scalable |
| **Google Cloud** | 12 months free | Bayar setelah | Learning |
| **DigitalOcean** | - | $4+/month | Reliable hosting |

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

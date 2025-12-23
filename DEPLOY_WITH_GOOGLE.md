# 🚀 Deploy ke Render via Google Login

Alternatif jika tidak bisa sambung GitHub ke Render. Bisa pakai **Google OAuth** untuk login!

---

## ✅ Setup (15 menit)

### Step 1: Sign Up Render dengan Google

1. Buka https://render.com
2. Klik **Sign up**
3. Pilih **Continue with Google**
4. Login dengan Google account kamu
5. Verify email (check Gmail)

✅ Done! Sudah punya Render account

---

### Step 2: Connect GitHub Repository Manual

1. **Di Render Dashboard**
   - Klik **New +** → **Web Service**
   - Scroll ke bawah
   - Pilih **Public Git Repository** (bukan GitHub integration)
   - Paste URL: `https://github.com/Davinaazalia/AES-BOX.git`
   - Klik **Connect**

2. **Configure Web Service:**
   - **Name**: aes-box (atau pilih sendiri)
   - **Environment**: Python 3
   - **Build Command**: 
     ```
     pip install -r backend/requirements.txt
     ```
   - **Start Command**: 
     ```
     gunicorn app_root:app
     ```
   - **Python Version**: 3.10

3. **Environment Variables:**
   - Klik **Environment** tab
   - Add:
     ```
     FLASK_ENV=production
     FLASK_DEBUG=False
     SECRET_KEY=<generate_random_string>
     ```

   Generate SECRET_KEY (copy-paste output):
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

4. **Deploy!**
   - Klik **Create Web Service**
   - Tunggu 2-3 menit
   - Aplikasi live! 🎉

---

### Step 3: Update Kapan-kapan (Manual Pull)

Jika ada update di GitHub dan mau deploy manual:

1. **Di Render Dashboard**
   - Pilih Web Service kamu
   - Klik **Manual Deploy** button
   - Tunggu build selesai

Atau untuk **auto-deploy**, ikuti [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

---

## 🎯 Alternative: Railway dengan Google

Railway juga bisa login via Google!

1. Buka https://railway.app
2. Klik **Sign up**
3. Pilih **Sign in with Google**
4. Connect GitHub repo manual di dashboard

---

## 📋 Checklist

- [ ] Sign up Render dengan Google
- [ ] Connect repo manual (public Git URL)
- [ ] Set environment variables
- [ ] Deploy!
- [ ] Test aplikasi

---

## 🆘 Troubleshooting

**"Build failed"**
- Check logs tab di Render
- Verify `requirements.txt` ada di `backend/` folder
- Verify Python version compatible

**"Application crashed"**
- Check SECRET_KEY di-set
- Check FLASK_ENV=production
- Check FLASK_DEBUG=False

**"Port error"**
- Render auto-assign port
- Gunakan environment variable: `$PORT`
- (Sudah di-handle di `app_root.py`)

---

## 🔗 Useful Links

- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- GitHub Public Repo URL format: `https://github.com/USERNAME/REPO.git`

---

**Setup selesai! Aplikasi berjalan live! 🚀**

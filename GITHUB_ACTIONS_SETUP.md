# 🔄 GitHub Actions Auto-Deploy Setup

Auto-deploy ke Render setiap kali push ke `main` branch!

## ⚙️ Setup Steps (10 menit)

### 1️⃣ Deploy ke Render Dulu (Manual)

Jika belum deploy ke Render, ikuti [DEPLOY.md](./DEPLOY.md) dulu.

### 2️⃣ Get Render Deploy Hook

1. **Buka Render Dashboard**
   - https://dashboard.render.com

2. **Pilih Web Service** kamu (misal: `aes-box`)

3. **Settings** → scroll ke **Deploy Hook**
   - Copy URL: `https://api.render.com/deploy/srv-xxxxxxxxxx?key=xxxxxxxxxxxxxxxx`

### 3️⃣ Add GitHub Secret

1. **GitHub Repo Settings**
   - Buka: https://github.com/Davinaazalia/AES-BOX/settings/secrets/actions
   - Klik `New repository secret`
   - **Name**: `RENDER_DEPLOY_HOOK`
   - **Value**: Paste Render hook URL (dari step 2)
   - Klik `Add secret`

### 4️⃣ Done! ✅

Sekarang setiap kali push:
```bash
git push origin main
```

Otomatis trigger deploy di Render dalam 30 detik!

---

## 📊 Verify Auto-Deploy

1. **GitHub:** Actions tab → lihat workflow running
2. **Render:** Deployments tab → lihat new deploy process

---

## 🔍 Troubleshooting

**GitHub Action gagal?**
- Check: Settings → Secrets & Variables → Actions
- Verify `RENDER_DEPLOY_HOOK` ada dan copy-paste benar

**Render deploy ga trigger?**
- Wait 30-60 sec (GitHub Action punya delay)
- Check Render activity log

**Webhook error di Render?**
- Verify deploy hook still active di Render settings
- Regenerate hook jika expired

---

## 📝 Workflow File

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Trigger Render deployment
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
        continue-on-error: true
```

Triggers otomatis ke Render saat ada push ke `main`.

---

## 🚀 Workflow

1. **Local Development**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **GitHub Actions** (automatic)
   - Runs `curl -X POST <RENDER_DEPLOY_HOOK>`
   - Notifies Render ada update

3. **Render** (automatic)
   - Pulls latest code
   - Install dependencies
   - Restart app
   - Done! Live dalam 2-3 min

---

## 📧 Optional: Email Notifications

Tambah ini di `deploy.yml` untuk email notif:

```yaml
- name: Notify deployment
  if: always()
  run: |
    echo "Deployment status: ${{ job.status }}"
    # Bisa add email notification di sini
```

---

Sekarang development jadi lebih simple:
- Edit code locally
- `git push`
- Langsung live! ✨


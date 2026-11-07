# CodeMotion Deployment Guide

## 🚀 Recommended: Deploy to Vercel (Free Tier)

Vercel is the **best option** for CodeMotion because:
- ✅ Built by the Next.js team (perfect compatibility)
- ✅ Serverless API routes work out of the box
- ✅ Easy PostgreSQL integration (Neon)
- ✅ Automatic GitHub deployments
- ✅ Free SSL certificates
- ✅ Global CDN
- ✅ Zero configuration needed

---

## Prerequisites

1. **GitHub Account** (already done ✅)
   - Your repo: https://github.com/kirtan597/Codemotion.git

2. **Neon Account** (for PostgreSQL database)
   - Sign up at: https://neon.tech (Free tier available)

3. **Vercel Account**
   - Sign up at: https://vercel.com (Free tier available)

---

## Step 1: Set Up Database (Neon PostgreSQL)

### 1.1 Create Neon Account
1. Go to https://neon.tech
2. Sign up with GitHub (easiest)
3. Create a new project called "codemotion"

### 1.2 Get Database URL
1. In Neon dashboard, click "Connection Details"
2. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this - you'll need it for Vercel

### 1.3 Initialize Database Schema
```bash
# In your local project
cd visualdsa-pro

# Create .env.local file
echo "DATABASE_URL=your-neon-connection-string-here" > .env.local

# Run database migrations
npx drizzle-kit push
```

---

## Step 2: Deploy to Vercel

### 2.1 Import from GitHub
1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repo: `kirtan597/Codemotion`
5. Click **"Import"**

### 2.2 Configure Project
Vercel will auto-detect Next.js. Configure:

**Framework Preset:** Next.js (auto-detected ✅)

**Root Directory:** `visualdsa-pro`

**Build Command:** 
```bash
pnpm install && pnpm run build
```

**Output Directory:** `.next` (auto-detected)

**Install Command:**
```bash
pnpm install
```

### 2.3 Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1.2 |
| `NODE_ENV` | `production` |

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your app will be live at: `https://codemotion-xxx.vercel.app`

---

## Step 3: Custom Domain (Optional)

### 3.1 Add Your Domain
1. In Vercel project → **"Settings"** → **"Domains"**
2. Add your domain (e.g., `codemotion.dev`)
3. Follow DNS configuration instructions

### 3.2 DNS Configuration Example (if using codemotion.dev)
Add these records to your DNS provider:

**A Record:**
```
@ → 76.76.21.21
```

**CNAME Record:**
```
www → cname.vercel-dns.com
```

Vercel will automatically provision SSL certificate.

---

## Alternative: Deploy to Netlify + External Database

⚠️ **More Complex Setup** - Only if you prefer Netlify:

### Why It's More Complex:
- Netlify functions have cold starts
- Need to configure serverless functions manually
- Less optimized for Next.js than Vercel

### Steps:
1. **Database:** Still need Neon (same as Step 1)
2. **Netlify Configuration:**
   - Install: `npm install -D @netlify/plugin-nextjs`
   - Add `netlify.toml`:
     ```toml
     [build]
       command = "cd visualdsa-pro && pnpm install && pnpm run build"
       publish = "visualdsa-pro/.next"
     
     [[plugins]]
       package = "@netlify/plugin-nextjs"
     
     [build.environment]
       NODE_VERSION = "20"
     ```
3. **Deploy:** Connect GitHub repo to Netlify

**Verdict:** Use Vercel instead - it's simpler and more reliable.

---

## Alternative: Deploy to Railway

Railway is another good option with built-in PostgreSQL:

### Advantages:
- ✅ Built-in PostgreSQL (no Neon needed)
- ✅ Simple deployment
- ✅ Good for full-stack apps

### Steps:
1. Go to https://railway.app
2. **"New Project"** → **"Deploy from GitHub"**
3. Select `kirtan597/Codemotion`
4. Add PostgreSQL service (Railway provides it)
5. Set root directory: `visualdsa-pro`
6. Deploy

**Cost:** Free tier includes $5/month credit (usually enough)

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Homepage loads: `/`
- [ ] Algorithm page works: `/visualize/sorting/bubble-sort`
- [ ] Share feature works (creates database entry)
- [ ] Shared links work: `/s/[id]`
- [ ] All 144 algorithms accessible
- [ ] No console errors
- [ ] Performance is good (check Lighthouse score)

### Test Share Feature:
1. Go to any algorithm visualization
2. Click "Share" button
3. Copy link
4. Open in incognito/private window
5. Verify it loads correctly

---

## Environment Variables Reference

Required for production:

```env
# Required
DATABASE_URL=postgresql://user:password@host/database

# Optional (auto-set by platform)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Troubleshooting

### Build Fails
**Error:** `Cannot find module 'pnpm'`
**Fix:** Ensure Vercel uses pnpm:
- Settings → General → Package Manager → Select "pnpm"

### Database Connection Error
**Error:** `DATABASE_URL environment variable is not set`
**Fix:** 
1. Check environment variables in Vercel dashboard
2. Redeploy after adding DATABASE_URL

### API Routes Return 404
**Error:** `/api/share` returns 404
**Fix:** 
- Ensure root directory is set to `visualdsa-pro`
- Check build logs for errors

### Cold Start Issues
**Symptom:** First request is slow
**Solution:** This is normal for serverless. Consider:
- Vercel Pro (keeps functions warm)
- Add loading states in UI

---

## Performance Optimization (Post-Deployment)

### 1. Enable Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Enable Speed Insights
```bash
npm install @vercel/speed-insights
```

### 3. Optimize Images
All images already use Next.js Image component ✅

---

## Monitoring & Maintenance

### Vercel Dashboard Features:
- **Deployments:** View build history
- **Analytics:** Track visitor stats
- **Logs:** Debug production issues
- **Environment Variables:** Update secrets

### Recommended Monitoring:
1. **Vercel Analytics** (built-in, free)
2. **Sentry** (error tracking) - optional
3. **LogRocket** (session replay) - optional

---

## Cost Breakdown (Free Tier)

### Vercel (Hobby)
- ✅ Free
- ✅ 100 GB bandwidth/month
- ✅ Unlimited projects
- ✅ Serverless functions
- ✅ SSL certificates

### Neon (Free Tier)
- ✅ Free
- ✅ 0.5 GB storage
- ✅ 10 GB bandwidth/month
- ✅ Auto-suspend after inactivity

**Total Cost: $0/month** ✅

---

## Quick Deploy Commands

```bash
# Clone and setup locally
git clone https://github.com/kirtan597/Codemotion.git
cd Codemotion/visualdsa-pro
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Initialize database
npx drizzle-kit push

# Test locally
pnpm run dev

# Build for production
pnpm run build

# Test production build
pnpm run start
```

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Neon Docs:** https://neon.tech/docs
- **GitHub Repo:** https://github.com/kirtan597/Codemotion

---

## Summary

**Best Option:** Vercel + Neon PostgreSQL ⭐
- Easiest setup
- Best performance
- Free tier available
- Perfect for Next.js apps

**Time to Deploy:** ~10 minutes

**Recommended URL Structure:**
- Main: `codemotion.vercel.app` (or custom domain)
- API: Automatically handled
- Database: Managed by Neon

---

🎉 **Ready to deploy!** Follow Step 1 and Step 2 above to get CodeMotion live in under 10 minutes.

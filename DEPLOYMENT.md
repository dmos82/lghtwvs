# Deployment Guide - LGHTWVS

## Quick Start (5 minutes)

### 1. Create GitHub Repository

```bash
cd /Users/davidjmorin/LGHTWVS

# Set your GitHub credentials
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/lghtwvs.git
git branch -M main
git push -u origin main
```

### 2. Connect to Netlify

**Option A: Using Netlify UI (Easiest)**

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub (if not already)
3. Click "New site from Git"
4. Select "GitHub" → authorize → select `lghtwvs` repo
5. Build command: `echo 'Building...'`
6. Publish directory: `.` (root)
7. Click "Deploy site"

**Option B: Using Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd /Users/davidjmorin/LGHTWVS
netlify deploy --prod
```

### 3. Connect Your Domain

In Netlify dashboard:
1. Site settings → Domain management
2. Click "Add custom domain"
3. Enter: `lghtwvs.com`
4. Update GoDaddy DNS (already done! ✅)
5. Wait 5-10 minutes for SSL cert
6. Done! 🎉

---

## Pre-Deployment Checklist

- [ ] All images are in `/HERO` and `/INFO` folders
- [ ] `index.html` has correct image paths
- [ ] No broken links in overlay sections
- [ ] Debug mode disabled for production
- [ ] Tested on mobile and desktop locally
- [ ] CSS loads correctly
- [ ] JavaScript has no errors (check console)
- [ ] `.gitignore` file exists
- [ ] Git initialized and committed

---

## File Structure for Deployment

```
lghtwvs/
├── .git/              (Auto-created by git init)
├── .gitignore         ✅ Created
├── index.html         ✅ Created
├── styles.css         ✅ Created
├── script.js          ✅ Created
├── package.json       ✅ Created
├── netlify.toml       ✅ Created
├── README.md          ✅ Created
├── CUSTOMIZATION.md   ✅ Created
├── DEPLOYMENT.md      ✅ Created (this file)
│
├── HERO/
│   ├── lghtwvs 1.JPG  ✅ Your images
│   ├── lghtwvs 2.JPG
│   └── ... (up to 11)
│
└── INFO/
    ├── LGHTWVS INFO 1.TIF  ✅ Your images
    ├── LGHTWVS INFO 2.TIF
    └── ... (up to 7)
```

---

## Environment Configuration

### Netlify.toml

Already configured with:
- Cache headers for images (1 year)
- Security headers
- Redirects for SPA routing
- Build settings

No changes needed unless you add features!

### Performance Optimizations

**Automatic (Netlify handles):**
- ✅ Image optimization (WebP, compression)
- ✅ CDN delivery (global edge servers)
- ✅ Gzip compression
- ✅ Minification

**Manual (optional):**
- Image optimization: See `CUSTOMIZATION.md`
- CSS minification: Use cssnano
- JavaScript minification: Use terser

---

## Troubleshooting Deployment

### Site won't load after deployment

**Check:**
1. Netlify deployment logs
2. Image paths relative (not absolute)
3. CORS headers (shouldn't be needed for static files)

**Solution:**
```bash
# Check what Netlify sees
netlify deploy --dry-run

# Force redeploy
netlify deploy --prod --trigger
```

### Images broken (404)

**Cause:** Image paths wrong or files not in Git

**Solution:**
```bash
# Verify files are in Git
git ls-files | grep -i hero
git ls-files | grep -i info

# If missing, add them
git add HERO/ INFO/
git commit -m "Add image files"
git push origin main
```

### Domain not pointing to Netlify

**Cause:** DNS not updated

**Solution:**
1. Check Netlify "Domain settings"
2. Copy nameservers
3. Update GoDaddy DNS
4. Wait 15-30 minutes for propagation

```bash
# Check DNS propagation
dig lghtwvs.com
dig www.lghtwvs.com
```

### SSL certificate not provisioning

**Cause:** Domain verification failed

**Solution:**
1. Wait up to 1 hour
2. Check Netlify certificate status
3. Force renewal: Site settings → SSL

---

## Continuous Deployment

Every time you `git push`:
1. GitHub notifies Netlify
2. Netlify checks for changes
3. Netlify re-deploys automatically
4. Your site updates live ✅

**To disable auto-deploy:**
- Netlify dashboard → Site settings → Build & deploy
- Turn off "Auto publish from Git"

---

## Git Workflow

### Making Changes

```bash
# Make local changes
# Edit files...

# Check what changed
git status

# Stage changes
git add .

# Commit with message
git commit -m "Update content and styling"

# Push to GitHub (auto-deploys)
git push origin main
```

### Reverting Changes

```bash
# See recent commits
git log --oneline

# Revert to previous version
git revert COMMIT_HASH

# Or reset hard (dangerous!)
git reset --hard COMMIT_HASH
git push origin main --force
```

---

## Monitoring & Analytics

### Netlify Analytics

Enable in Netlify dashboard → Site settings:
- Page views
- Network requests
- Build performance
- Deploy history

### Server Logs

```bash
# View deployment logs
netlify logs --tail

# View function logs (if using)
netlify logs --function function-name
```

### Custom Analytics

Add to `index.html` before `</body>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

---

## Performance Monitoring

### Core Web Vitals

Monitor in Netlify Analytics:
- **LCP** (Largest Contentful Paint) - Should be < 2.5s
- **FID** (First Input Delay) - Should be < 100ms
- **CLS** (Cumulative Layout Shift) - Should be < 0.1

### Tools

- [PageSpeed Insights](https://pagespeed.web.dev)
- [GTmetrix](https://gtmetrix.com)
- [WebPageTest](https://webpagetest.org)

### Optimization Tips

```javascript
// Disable debug mode in production (script.js)
window.zoomScroll.disableDebug();

// Preload critical resources (index.html)
<link rel="preload" as="image" href="HERO/lghtwvs 1.JPG">
```

---

## Backup & Version Control

### Local Backup

```bash
# Create zip backup
cd /Users/davidjmorin
zip -r LGHTWVS_backup_$(date +%Y%m%d).zip LGHTWVS/

# Move to safe location
mv LGHTWVS_backup*.zip ~/Backups/
```

### Git Backup

Your repo is automatically backed up on GitHub:
- All commits preserved
- All versions recoverable
- Collaboration-ready

---

## Scaling Beyond Initial Deployment

### Adding Features

1. **Music player**
   ```html
   <audio controls>
       <source src="music.mp3">
   </audio>
   ```

2. **Video backgrounds**
   ```html
   <video autoplay muted>
       <source src="video.mp4">
   </video>
   ```

3. **Contact form**
   - Use Netlify Forms or Formspree
   - Add `name="contact"` to form

4. **Blog/Dynamic content**
   - Integrate with Contentful CMS
   - Or use Jekyll/Hugo

### Using Serverless Functions

Create `netlify/functions/api.js`:

```javascript
exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello!' })
    };
};
```

Deploy automatically with `git push`!

---

## Cost Estimation

| Feature | Netlify Free | Pro | Enterprise |
|---------|-------------|-----|-----------|
| Deployment | ✅ Free | - | - |
| Bandwidth | 100GB/mo | Unlimited | Unlimited |
| Functions | 125,000/mo | Unlimited | Unlimited |
| Storage | 100MB | Unlimited | Unlimited |
| Custom domain | ✅ Yes | Yes | Yes |
| SSL cert | ✅ Auto | Auto | Auto |
| CDN | ✅ Global | Global | Global |

**Your site:** 100% free on Netlify Free tier (plenty of bandwidth for portfolio)

---

## Next Steps

1. ✅ Create GitHub account
2. ✅ Push code to GitHub
3. ✅ Connect to Netlify
4. ✅ Add custom domain
5. ✅ Test all features
6. ✅ Share link!

---

## Support Resources

- [Netlify Docs](https://docs.netlify.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com)
- Netlify Support Chat (pro feature)

---

**Your site is production-ready! 🚀**

Current status:
- ✅ Site built: `/Users/davidjmorin/LGHTWVS`
- ✅ Git initialized with first commit
- ✅ Ready for GitHub push
- ✅ Ready for Netlify connection
- ✅ Running locally on `http://localhost:8888`

Next: Push to GitHub and connect to Netlify!

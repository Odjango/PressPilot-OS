# PressPilot - AI WordPress Site Generator (MVP)

**Version:** 1.0.0-MVP  
**Built for:** Mort (PP Theme Builder)  
**Architecture:** Modular (Hasan's 3 AI Coding Tricks Applied)

---

## 🎯 What This Does

Generate complete 5-page WordPress websites in 90 seconds:
- User inputs: Business Name + Business Type + Logo
- AI outputs: Complete WordPress site with 5 pages

## 📦 What's Inside

```
presspilot-plugin/
├── presspilot.php              # Main plugin file
├── modules/                    # Modular components (Trick #1)
│   ├── input-handler.php       # Form & logo upload
│   ├── color-extractor.php     # Logo color analysis
│   ├── content-generator.php   # OpenAI GPT integration
│   ├── theme-matcher.php       # WordPress theme selection
│   ├── site-assembler.php      # Page creation
│   └── export-handler.php      # Site export
├── patterns/                   # Business type templates (Trick #2)
│   ├── restaurant.json
│   ├── fitness.json
│   ├── corporate.json
│   └── ecommerce.json
└── assets/                     # Admin interface
    ├── admin.css
    └── admin.js
```

## 🚀 Installation

### Option 1: Upload via WordPress Admin (EASIEST)
1. Compress `presspilot-plugin` folder to `presspilot.zip`
2. Go to WordPress Admin → Plugins → Add New
3. Click "Upload Plugin"
4. Select `presspilot.zip`
5. Click "Install Now" → "Activate"

### Option 2: FTP Upload
1. Upload `presspilot-plugin` folder to `/wp-content/plugins/`
2. Go to WordPress Admin → Plugins
3. Find "PressPilot" and click "Activate"

## ⚙️ Configuration

**OpenAI API Key is already configured in the plugin.**

If you need to change it later, edit line 29 in `presspilot.php`:
```php
define('PRESSPILOT_OPENAI_KEY', 'your-new-key-here');
```

## 📖 How to Use

1. Go to WordPress Admin → **PressPilot** (in sidebar)
2. Fill in:
   - Business Name (e.g., "Joe's Pizza House")
   - Business Type (Restaurant/Fitness/Corporate/E-commerce)
   - Upload Logo
3. Click **"Generate My Website"**
4. Wait 60-90 seconds
5. Review generated pages (created as drafts)
6. Edit, publish, done! ✨

## 🎨 What Gets Created

**5 WordPress Pages (Auto-Published):**
- **Home** - Hero section, benefits, CTA (set as front page)
- **About Us** - Story, mission, values, team
- **Services** - 4 services with descriptions
- **Blog** - Blog intro and sample post ideas
- **Contact** - Contact info, hours, response promise

**Navigation Menu (Auto-Created):**
- Menu created with proper page order
- Set as Primary Menu automatically
- Pages arranged: Home → About Us → Services → Blog → Contact

**All pages published and ready to view immediately!**

## 🔧 Architecture Highlights

### Modularization (Trick #1)
- Each feature is independent file
- Update one module without breaking others
- Easy to add new business types

### Patterns (Trick #2)
- Each business type has proven template
- Consistent tone, style, keywords
- Reference patterns for AI generation

### Documentation Injection (Trick #3)
- OpenAI API structure embedded in code
- Business type contexts in patterns
- No guesswork, reliable output

## 🎯 MVP Features

✅ 4 business types (Restaurant, Fitness, Corporate, E-commerce)  
✅ Logo color extraction  
✅ OpenAI GPT-3.5-Turbo content generation  
✅ Curated WordPress themes  
✅ 5-page site creation  
✅ **Auto-publish pages** (fully automatic)  
✅ **Auto-create navigation menu** (proper page order)  
✅ **Set Home as front page** (automatic)  
✅ **One-click site generation** (no manual setup required)  

## 🔜 Future Enhancements (Phase 2)

- WordPress.org API (6000+ themes)
- Unsplash stock photos
- Google Fonts integration
- GPT-4 upgrade option
- Full ZIP export
- White-label options

## 💡 Cost Per Generation

**Using GPT-3.5-Turbo:** ~$0.05 per site  
**Monthly estimate (100 sites):** ~$5 OpenAI costs

## 🐛 Troubleshooting

**Pages not creating?**
- Check OpenAI API key is valid
- Verify API has credits
- Check WordPress error logs

**Logo upload fails?**
- Max file size: 5MB
- Supported: PNG, JPG, SVG, WebP
- Check WordPress upload permissions

**Content generation slow?**
- Normal: 60-90 seconds
- Check internet connection
- OpenAI API may be experiencing delays

## 📞 Support

This is MVP v1.0.0 built specifically for Mort's PressPilot project.

**Built:** 2025-10-21  
**Architecture:** Modular, scalable, maintainable  
**Next Phase:** Add Unsplash API, WordPress.org API integration

---

**Powered by:**
- OpenAI GPT-3.5-Turbo
- WordPress 6.0+
- PHP 8.0+
- Modern AI coding principles

🚀 **Ready to generate sites in 90 seconds!**

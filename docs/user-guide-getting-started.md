# Getting Started with PressPilot OS

> A quick guide to generating and installing your first WordPress theme.

---

## Prerequisites

- A logo image (PNG or JPG, recommended 500x500px or larger)
- Your business name, tagline, and a short description
- A WordPress site (self-hosted or WordPress.com Business plan)
- FTP/SFTP access or WordPress admin access to upload themes

---

## Step 1: Prepare Your Logo and Business Info

Before you start:
- **Logo:** Square format works best; transparent PNG recommended
- **Business Name:** Your official business name (appears in header/footer)
- **Tagline:** A short phrase (e.g., "Fresh Italian Cuisine Since 1985")
- **Description:** 1-2 sentences about what you do (used for homepage content)
- **Industry/Category:** Helps PressPilot choose the right layout and patterns

---

## Step 2: Generate Your Theme in PressPilot Studio

1. Go to [PressPilot Studio](https://presspilotapp.com/studio) (or your self-hosted instance)
2. Upload your logo
3. Fill in business details (name, tagline, description)
4. Select your industry category (e.g., Restaurant, Agency, Portfolio)
5. Choose a hero layout style (fullBleed, fullWidth, split, or minimal)
6. Click **Generate Theme**
7. Wait ~90 seconds for the preview to appear
8. Download the `.zip` file

---

## Step 3: Install the Theme in WordPress

### Option A: Via WordPress Admin (Recommended)

1. Log in to your WordPress admin (`yoursite.com/wp-admin`)
2. Go to **Appearance > Themes**
3. Click **Add New** > **Upload Theme**
4. Choose the `.zip` file you downloaded
5. Click **Install Now**
6. After installation, click **Activate**

### Option B: Via FTP/SFTP

1. Unzip the theme file on your computer
2. Connect to your server via FTP/SFTP
3. Upload the theme folder to `/wp-content/themes/`
4. In WordPress admin, go to **Appearance > Themes** and activate

---

## Step 4: Customize in Site Editor

1. Go to **Appearance > Editor** (or **Site Editor** in newer WordPress)
2. You'll see your homepage with the generated layout
3. Click any block to edit text, images, or colors
4. Use the Styles panel (top-right) to change fonts and colors globally
5. Save your changes

---

## Troubleshooting

### Theme doesn't appear after upload
- Check that the `.zip` contains a folder with `style.css` and `theme.json`
- Ensure file permissions allow WordPress to read the theme

### "Attempt Recovery" errors on blocks
- This usually means a block has invalid markup
- Try regenerating the theme with different settings
- Report persistent issues with the theme.zip attached

### Colors don't match my logo
- PressPilot extracts colors from your logo automatically
- For better results, use a logo with clear, distinct colors
- You can override colors in Site Editor > Styles > Colors

---

## Next Steps

- Customize your homepage content in Site Editor
- Add pages (About, Contact, Menu) via **Pages > Add New**
- Configure your navigation menu in **Appearance > Editor > Navigation**
- Set up contact forms using a plugin (WPForms, Contact Form 7)

---

*Generated themes are fully compatible with WordPress 6.0+ and the Site Editor.*

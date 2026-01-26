# Lemon Squeezy Integration Guide

## Setup Instructions

### Step 1: Create Lemon Squeezy Account
1. Go to https://lemonsqueezy.com
2. Sign up for an account
3. Complete business verification

### Step 2: Create Products

#### Product 1: Single WordPress Theme
- **Name:** PressPilot WordPress Theme
- **Price:** $29.99 USD
- **Type:** Digital Product
- **Description:** Professional WordPress FSE theme, generated instantly. No subscriptions, own it forever.

#### Product 2: Agency Bundle
- **Name:** PressPilot Agency Bundle (6 Themes)
- **Price:** $149.99 USD
- **Type:** Digital Product
- **Description:** 6 professional WordPress themes for agencies. Save $30 compared to individual purchases.

### Step 3: Get API Credentials

1. Go to Settings → API
2. Create new API key
3. Copy the following:
   - API Key
   - Store ID
   - Webhook Secret

### Step 4: Configure Environment Variables

Add to `.env.local`:

```env
# Lemon Squeezy Configuration
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_STORE_ID=your_store_id_here
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here

# Product IDs (get these after creating products)
LEMON_SQUEEZY_SINGLE_PRODUCT_ID=product_id_for_single_theme
LEMON_SQUEEZY_BUNDLE_PRODUCT_ID=product_id_for_agency_bundle
```

### Step 5: Set Up Webhook

1. Go to Settings → Webhooks
2. Create new webhook
3. **URL:** `https://your-domain.com/api/lemon-squeezy/webhook`
4. **Events to listen for:**
   - `order_created`
   - `order_refunded`
5. **Secret:** Copy the webhook secret to your `.env.local`

### Step 6: Test Mode

Lemon Squeezy has a test mode. Enable it for testing:
1. Go to Settings → Test Mode
2. Toggle ON
3. Use test card: `4242 4242 4242 4242`

---

## Integration Flow

### User Journey
```
1. User selects hero style on /preview
   ↓
2. Redirected to /checkout with previewId and style
   ↓
3. Lemon Squeezy checkout opens (embedded or redirect)
   ↓
4. User completes payment
   ↓
5. Webhook received at /api/lemon-squeezy/webhook
   ↓
6. Full theme generates with selected hero
   ↓
7. User redirected to /download with theme URL
   ↓
8. Email sent with download link
```

### Technical Flow
```
Frontend (checkout page)
  → Creates Lemon Squeezy checkout session
  → Passes custom data: { previewId, selectedStyle }
  
Lemon Squeezy
  → Processes payment
  → Sends webhook to our server
  
Backend (webhook handler)
  → Verifies webhook signature
  → Extracts previewId and selectedStyle
  → Generates full theme with selected hero
  → Uploads theme ZIP to storage
  → Updates database with download URL
  → Sends confirmation email
  
Frontend (download page)
  → Fetches theme URL from database
  → Shows download button
  → Displays installation instructions
```

---

## Environment Variables Reference

| Variable | Purpose | Where to Get It |
|----------|---------|-----------------|
| `LEMON_SQUEEZY_API_KEY` | Authenticate API requests | Settings → API |
| `LEMON_SQUEEZY_STORE_ID` | Identify your store | Settings → General |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Verify webhook authenticity | Settings → Webhooks |
| `LEMON_SQUEEZY_SINGLE_PRODUCT_ID` | Single theme product | Products → Copy ID |
| `LEMON_SQUEEZY_BUNDLE_PRODUCT_ID` | Agency bundle product | Products → Copy ID |

---

## Testing Checklist

- [ ] Create Lemon Squeezy account
- [ ] Create 2 products (single + bundle)
- [ ] Get API credentials
- [ ] Add environment variables
- [ ] Set up webhook endpoint
- [ ] Test with test mode card
- [ ] Verify webhook receives payment
- [ ] Verify theme generates after payment
- [ ] Verify email is sent
- [ ] Test download link works
- [ ] Switch to live mode

---

## Support Resources

- **Lemon Squeezy Docs:** https://docs.lemonsqueezy.com
- **API Reference:** https://docs.lemonsqueezy.com/api
- **Webhook Guide:** https://docs.lemonsqueezy.com/guides/developer/webhooks
- **Test Cards:** https://docs.lemonsqueezy.com/help/getting-started/test-mode

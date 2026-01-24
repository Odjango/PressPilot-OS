# PROJECT SCOPE & VISION: PressPilot

## 1. The Core Concept
PressPilot is a SaaS platform that allows non-coders to generate custom WordPress FSE (Block) Themes by entering business details. It uses AI to populate content and a deterministic engine to build the code.

## 2. User Workflow (The Vision)
1.  **Input:** User enters Business Name, Logo, Tagline, and Description.
2.  **Selection:** User picks a "Kit" (Industry) and Style (Fonts/Colors).
3.  **Generation:** The engine builds a unique WordPress theme zip file.
    * *Future Goal:* Auto-integrate WooCommerce for E-commerce kits.
    * *Future Goal:* Auto-populate "Menu" pages for Restaurant kits.
4.  **Preview:** User sees 3 design variations before downloading.

## 3. Current Implementation Status
* **Existing:** We have the "Canonical Block Generator" that builds valid HTML.
* **Existing:** We have the CI/CD pipeline to validate themes.
* **In Progress:** Fixing "Attempt Recovery" errors in the generated themes.
* **Missing (To Build):** The AI Content Generation (OpenAI integration) and the "Restaurant/E-commerce" specific logic.

## 4. Design Guidelines
* **Fonts:** Must support Google Fonts natively.
* **Colors:** Users choose from 5-7 pre-set palettes.
* **Languages:** Support for English, Spanish, French, Italian, and Arabic (RTL).

## Phase 4: Production Scalability (The 1000-User Goal)
- [ ] **Implement Async Job Queue (BullMQ/Redis):**
    - Move generation logic out of the main API response.
    - Create a "Job ID" system so the frontend can poll for status.
    - Prevent Node.js event loop blocking during high traffic.
    - Required before public launch.

## Phase 5: Business Logic (Payments & Auth)
- [x] **Supabase Integration:** (COMPLETED) - App is connected. Auth is ready.
- [ ] **Credit System:** Create `user_credits` table (UUID, integer).
- [ ] **Lemon Squeezy Integration:**
  - Create "One-Time Credit" and "Subscription" products in LS Dashboard.
  - **Webhook Handler:** Build an n8n workflow to listen for `order_created`.
  - **Logic:** Match email -> increment Supabase credits.
  - **Frontend:** Add "Buy Credits" overlay using the Lemon Squeezy Checkout SDK.
- [ ] **n8n Gatekeeper:**
  - Update "Generate" workflow to check `credits > 0`.
  - If 0, return 402 error.

## Phase 6: Infrastructure (Going Live)
- [ ] **Dockerize the Engine:** Create a production `Dockerfile` for the Next.js/Node app.
- [ ] **Server Setup (Coolify/DigitalOcean):**
  - Provision a $6/mo Droplet (Ubuntu).
  - Install Coolify (Self-hosted PaaS).
  - Connect GitHub repo for auto-deployments.
- [ ] **Domain & DNS:** Point `presspilot.io` to the VPS.
- [ ] **SSL & Security:** Auto-provision Let's Encrypt certs.

## Phase 7: The "Go Live" Checklist
- [ ] Full End-to-End Test (Payment -> Credit Add -> Generation -> Email).
- [ ] UI Polish (Loading states, Error messages).
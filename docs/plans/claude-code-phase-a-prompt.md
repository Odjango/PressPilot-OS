# Claude Code Terminal Prompt — Phase A Smoke Test

## Paste this into Claude Code terminal:

---

Run Phase A smoke tests for PressPilot. Use parallel agents to test all 5 verticals simultaneously via the production API.

**API:** `POST https://presspilotapp.com/api/generate` then poll `GET https://presspilotapp.com/api/status?id={jobId}`

**Test matrix (run ALL 5 in parallel using subagents):**

1. **Restaurant:** name="Luigi's Pizza", tagline="Authentic Italian Pizza Since 1987", description="Family-owned pizzeria serving authentic Neapolitan-style pizza with fresh imported ingredients. Wood-fired oven, handmade pasta, warm hospitality. Dine-in, takeout, catering.", category="restaurant", heroLayout="fullBleed", colorPrimary="#C8102E", colorSecondary="#FFD700", fontProfile="modern"

2. **SaaS:** name="TechFlow", tagline="Automate Your Workflow", description="Project management SaaS helping teams streamline workflows with AI-powered automation, real-time collaboration, customizable dashboards. Trusted by 500+ teams.", category="saas", heroLayout="split", colorPrimary="#2563EB", colorSecondary="#10B981", fontProfile="modern"

3. **Portfolio:** name="Sarah Chen Photography", tagline="Capturing Life's Beautiful Moments", description="Award-winning portrait and wedding photographer in Austin TX. Natural light, editorial shoots, documentary wedding coverage. 200+ weddings, fine art approach.", category="portfolio", heroLayout="fullWidth", colorPrimary="#1A1A1A", colorSecondary="#D4AF37", fontProfile="elegant"

4. **Ecommerce:** name="UrbanThreads", tagline="Streetwear That Speaks", description="Online streetwear brand with limited-edition graphic tees, hoodies, accessories by independent artists. Ethically produced, sustainable materials. Free shipping over $75.", category="ecommerce", heroLayout="fullBleed", colorPrimary="#000000", colorSecondary="#FF6B35", fontProfile="bold"

5. **Local Service:** name="BrightSmile Dental", tagline="Your Family's Smile, Our Priority", description="Family dental practice offering cleanings, cosmetic dentistry, orthodontics, emergency services. Dr. Patel serving Riverside community 15+ years. New patients welcome.", category="local_service", heroLayout="minimal", colorPrimary="#0891B2", colorSecondary="#F0F9FF", fontProfile="friendly"

**For each test:**
1. POST to /api/generate with the data above
2. Poll /api/status?id={jobId} every 5s until completed or failed (timeout 90s)
3. Record: status, generation time, themeUrl, any errors
4. If completed, download the ZIP and inspect: check theme.json exists, templates/index.html exists, parts/footer.html contains "presspilot"

**After all 5 complete, write results to `docs/plans/phase-a-results.md`** with:
- Summary table (vertical, status, time, download URL)
- Any errors or failures
- Overall PASS/FAIL verdict (PASS = all 5 generate successfully)

Use `superpowers:dispatching-parallel-agents` to run all 5 tests concurrently.

---

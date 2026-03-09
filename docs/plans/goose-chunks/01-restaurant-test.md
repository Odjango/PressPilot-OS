# Chunk 01: Restaurant Theme Test (Luigi's Pizza)

## Setup
Create output folder: `mkdir -p ~/Desktop/presspilot-phase-a-results`

## Steps

1. Open browser to: https://presspilotapp.com/studio
2. Screenshot the empty form → save as `~/Desktop/presspilot-phase-a-results/01-form-empty.png`
3. Fill out the form:
   - Business Name: `Luigi's Pizza`
   - Tagline: `Authentic Italian Pizza Since 1987`
   - Description: `Family-owned pizzeria in downtown serving authentic Neapolitan-style pizza with fresh imported ingredients. Known for our wood-fired oven, handmade pasta, and warm Italian hospitality. We offer dine-in, takeout, and catering for events.`
   - Category: `Restaurant`
   - Hero Layout: `Full Bleed`
   - Primary Color: `#C8102E`
   - Secondary Color: `#FFD700`
   - Font: `Modern`
   - Logo: skip (leave empty)
4. Screenshot filled form → `~/Desktop/presspilot-phase-a-results/01-form-filled.png`
5. Click Generate
6. Screenshot the loading/progress state → `~/Desktop/presspilot-phase-a-results/01-generating.png`
7. Wait for completion (up to 60 seconds)
8. Screenshot the result page → `~/Desktop/presspilot-phase-a-results/01-result.png`

## If it worked — check these things:

9. Scroll through the preview or download the ZIP. For each, take a screenshot:
   - Homepage hero section → `~/Desktop/presspilot-phase-a-results/01-hero.png`
     - CHECK: Is the header text WHITE over the hero image? (transparent header fix)
   - Footer → `~/Desktop/presspilot-phase-a-results/01-footer.png`
     - CHECK: Logo + name side-by-side? "Powered by PressPilot" present?
   - Any inner page (About/Menu/Contact) → `~/Desktop/presspilot-phase-a-results/01-inner-page.png`
   - Any testimonials section → `~/Desktop/presspilot-phase-a-results/01-testimonials.png`
     - CHECK: Are images of PEOPLE (not food)?

10. Read all visible text and check: are there any cut-off words? (like "smok" or "thre" instead of full words)

## If it failed:
- Screenshot the error → `~/Desktop/presspilot-phase-a-results/01-error.png`
- Note the error message

## Write results
Create `~/Desktop/presspilot-phase-a-results/01-results.txt` with:
```
Test: Restaurant (Luigi's Pizza)
Status: PASS / FAIL
Generation time: ___s
Transparent header: PASS / FAIL / N/A
Footer composition: PASS / FAIL / N/A
Person images in testimonials: PASS / FAIL / N/A
Inner pages exist: PASS / FAIL / N/A
Truncated words found: YES (list them) / NO
Brand colors visible: PASS / FAIL
PressPilot credit: PASS / FAIL
Notes: ___
```

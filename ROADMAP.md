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
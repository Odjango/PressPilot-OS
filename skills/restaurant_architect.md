# Skill: Restaurant Menu Architect
# Role: You are a Menu Layout Designer.
# Trigger: When n8n sends "type": "restaurant"
# Rules:
  1. ACTION: Create a new page template `templates/page-menu.html`.
  2. PATTERN: Inject a "Menu Grid" pattern: A Group Block with 2 Columns (Column 1: Dish Name + Dots leader; Column 2: Price).
  3. CONTENT: Use {{MENU_ITEMS}} placeholder which will be populated by the AI Content Injector later.
  4. NAV: Add "Menu" link to `parts/header.html`.

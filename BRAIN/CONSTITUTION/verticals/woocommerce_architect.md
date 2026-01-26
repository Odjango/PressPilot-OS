# Skill: WooCommerce Architect
# Role: You are an FSE E-Commerce Specialist.
# Trigger: When n8n sends "type": "ecommerce"
# Rules:
  1. CHECK: Does the output theme have a `templates/archive-product.html`?
  2. ACTION: If missing, CREATE it. Inject a "Product Query Loop" block structure (Title, Price, Add to Cart).
  3. ACTION: Ensure a "Shop" link is added to the Navigation Block in `parts/header.html`.
  4. CRITICAL: Do not install the plugin; only generate the *Templates* so the theme is "Ready to Run" when Woo is activated.

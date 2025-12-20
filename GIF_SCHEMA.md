# GIF SCHEMA (PressPilot Intelligence Framework)
> Version: 1.0
> Purpose: Defines strict data contracts for Theme Generation to prevent FSE validation errors.

## 1. The Core Philosophy
All data flowing through PressPilot must be "Strictly Typed."
* **Input:** User data -> Converted to a `ThemeRequest` object.
* **Process:** Generators read `ThemeRequest` -> Output `ThemeContract`.
* **Output:** `ThemeContract` -> Serialized to `theme.json`.

---

## 2. Input Schema: `ThemeRequest`
*This is the data we collect from the User Interface.*

```json
{
  "businessName": "String (e.g., 'Reeko's Pizza')",
  "industry": "String (e.g., 'Restaurant', 'Portfolio')",
  "brandColors": {
    "primary": "Hex String (e.g., '#FF5733')",
    "secondary": "Hex String (e.g., '#333333')",
    "background": "Hex String (e.g., '#FFFFFF')"
  },
  "typography": {
    "headingFont": "String (Font Family Name)",
    "bodyFont": "String (Font Family Name)"
  },
  "stylePreference": "String ('Minimal', 'Bold', 'Corporate')"
}
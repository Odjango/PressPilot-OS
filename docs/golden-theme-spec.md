# PressPilot Golden Theme Spec

This document explains how the **PressPilot WordPress Theme Generator** MUST use
the `golden-spec/` folder when generating any new FSE (block) theme.

The goal is simple:

> Never ship a theme that triggers the WordPress Editor “Attempt Recovery” error.

Instead of creating templates and theme.json from scratch, the generator always
starts from a **known-good, production-grade skeleton** stored in:

`/golden-spec`

---

## 1. Golden Spec Folder

The folder structure:

```text
golden-spec/
  README-golden-spec.md
  golden-theme-rules.md
  golden-theme.json

  templates/
    index.html

  parts/
    header.html
    footer.html

  patterns/
    home-hero.html
    home-services.html

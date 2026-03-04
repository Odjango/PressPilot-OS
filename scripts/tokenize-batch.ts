#!/usr/bin/env tsx
/**
 * tokenize-batch.ts — Batch tokenizer for proven-core patterns.
 *
 * Reads patterns from proven-cores/, applies category-based token mappings,
 * writes tokenized copies to pattern-library/tokenized/, and emits a combined
 * manifest at pattern-library/batch-manifest.json.
 *
 * CRITICAL INVARIANT: Block comment lines (<!-- wp:... -->) are NEVER modified.
 */

import fs from 'fs-extra';
import path from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenMapping {
  category: string;
  tokenMap: Record<string, string[]>;
}

interface TokenReplacement {
  token: string;
  tag: string;
  position: number;
  original: string;
}

interface PatternManifest {
  patternId: string;
  source: string;
  output: string;
  category: string;
  tokensUsed: string[];
  replacements: TokenReplacement[];
}

interface PatternJob {
  patternId: string;        // e.g. "ollie/hero-light"
  source: string;           // full path to source .php
  outputRelative: string;   // relative under pattern-library/tokenized/
  category: string;         // token mapping category key
}

// ── Mapping loader ────────────────────────────────────────────────────────────

const MAPPINGS_DIR = path.resolve(__dirname, 'token-mappings');

const mappingCache: Record<string, TokenMapping> = {};

async function loadMapping(category: string): Promise<TokenMapping> {
  if (mappingCache[category]) return mappingCache[category];
  const p = path.join(MAPPINGS_DIR, `${category}.json`);
  if (!(await fs.pathExists(p))) {
    throw new Error(`No mapping file for category "${category}" at ${p}`);
  }
  const m = (await fs.readJson(p)) as TokenMapping;
  mappingCache[category] = m;
  return m;
}

// ── Tokenizer core ────────────────────────────────────────────────────────────

function protectBlockComments(content: string): { safe: string; comments: string[] } {
  const comments: string[] = [];
  const safe = content.replace(/<!--[\s\S]*?-->/g, (m) => {
    comments.push(m);
    return `__BLKCOMM_${comments.length - 1}__`;
  });
  return { safe, comments };
}

function restoreBlockComments(content: string, comments: string[]): string {
  return content.replace(/__BLKCOMM_(\d+)__/g, (_m, idx) => comments[Number(idx)] ?? _m);
}

function replaceInTag(
  html: string,
  tag: string,
  tokens: string[],
  out: TokenReplacement[],
): string {
  if (!tokens || tokens.length === 0) return html;
  let idx = 0;
  const re = new RegExp(`(<${tag}(?:\\s[^>]*)?>)([\\s\\S]*?)(<\\/${tag}>)`, 'gi');
  return html.replace(re, (full, open, inner, close) => {
    if (idx >= tokens.length) return full;
    const trimmed = inner.trim();
    if (!trimmed) return full;
    // Skip if inner contains child HTML tags (nested markup — don't touch)
    if (/<[a-zA-Z]/.test(trimmed)) return full;
    const token = tokens[idx++];
    out.push({ token, tag, position: idx, original: trimmed });
    return `${open}{{${token}}}${close}`;
  });
}

function replaceAltAttrs(
  html: string,
  tokens: string[],
  out: TokenReplacement[],
): string {
  if (!tokens || tokens.length === 0) return html;
  let idx = 0;
  return html.replace(/alt="([^"]*)"/gi, (full, val) => {
    if (idx >= tokens.length) return full;
    const token = tokens[idx++];
    out.push({ token, tag: 'alt', position: idx, original: val });
    return `alt="{{${token}}}"`;
  });
}

function tokenize(source: string, mapping: TokenMapping): { result: string; replacements: TokenReplacement[] } {
  const { safe, comments } = protectBlockComments(source);
  const replacements: TokenReplacement[] = [];
  let working = safe;

  // Process tags in priority order
  for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'li']) {
    const tokens = mapping.tokenMap[tag];
    if (tokens) {
      working = replaceInTag(working, tag, tokens, replacements);
    }
  }
  // Alt attributes
  if (mapping.tokenMap.alt) {
    working = replaceAltAttrs(working, mapping.tokenMap.alt, replacements);
  }

  const result = restoreBlockComments(working, comments);
  return { result, replacements };
}

// ── Job list ──────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const CORES = path.join(ROOT, 'proven-cores');
const OUT = path.join(ROOT, 'pattern-library', 'tokenized');

const JOBS: PatternJob[] = [
  // ── Heroes (6) ──
  { patternId: 'ollie/hero-light',                  source: 'ollie/patterns/hero-light.php',                          outputRelative: 'ollie/hero-light.php',               category: 'hero' },
  { patternId: 'ollie/hero-dark',                   source: 'ollie/patterns/hero-dark.php',                           outputRelative: 'ollie/hero-dark.php',                category: 'hero' },
  { patternId: 'ollie/hero-call-to-action-buttons',  source: 'ollie/patterns/hero-call-to-action-buttons.php',         outputRelative: 'ollie/hero-call-to-action-buttons.php', category: 'hero' },
  { patternId: 'frost/hero-one-column',             source: 'frost/patterns/hero-one-column.php',                     outputRelative: 'frost/hero-one-column.php',          category: 'hero' },
  { patternId: 'spectra-one/hero-banner',           source: 'spectra-one/patterns/hero-banner.php',                   outputRelative: 'spectra-one/hero-banner.php',        category: 'hero' },
  { patternId: 'tt4/banner-hero',                   source: 'twentytwentyfour/patterns/banner-hero.php',              outputRelative: 'tt4/banner-hero.php',                category: 'hero' },

  // ── Features (6) ──
  { patternId: 'ollie/feature-boxes-with-button',   source: 'ollie/patterns/feature-boxes-with-button.php',           outputRelative: 'ollie/feature-boxes-with-button.php',  category: 'features' },
  { patternId: 'ollie/features-with-emojis',        source: 'ollie/patterns/features-with-emojis.php',                outputRelative: 'ollie/features-with-emojis.php',       category: 'features' },
  { patternId: 'ollie/text-and-image-columns-with-icons', source: 'ollie/patterns/text-and-image-columns-with-icons.php', outputRelative: 'ollie/text-and-image-columns-with-icons.php', category: 'features' },
  { patternId: 'spectra-one/feature',               source: 'spectra-one/patterns/feature.php',                       outputRelative: 'spectra-one/feature.php',              category: 'features' },
  { patternId: 'spectra-one/feature-2',             source: 'spectra-one/patterns/feature-2.php',                     outputRelative: 'spectra-one/feature-2.php',            category: 'features' },
  { patternId: 'tt4/text-feature-grid-3-col',       source: 'twentytwentyfour/patterns/text-feature-grid-3-col.php',  outputRelative: 'tt4/text-feature-grid-3-col.php',      category: 'features' },

  // ── CTAs (5) ──
  { patternId: 'ollie/text-call-to-action',          source: 'ollie/patterns/text-call-to-action.php',                outputRelative: 'ollie/text-call-to-action.php',         category: 'cta' },
  { patternId: 'ollie/card-call-to-action',          source: 'ollie/patterns/card-call-to-action.php',                outputRelative: 'ollie/card-call-to-action.php',         category: 'cta' },
  { patternId: 'spectra-one/call-to-action',         source: 'spectra-one/patterns/call-to-action.php',               outputRelative: 'spectra-one/call-to-action.php',        category: 'cta' },
  { patternId: 'spectra-one/call-to-action-2',       source: 'spectra-one/patterns/call-to-action-2.php',             outputRelative: 'spectra-one/call-to-action-2.php',      category: 'cta' },
  { patternId: 'frost/cta-button',                   source: 'frost/patterns/cta-button.php',                         outputRelative: 'frost/cta-button.php',                  category: 'cta' },

  // ── Pricing (4) ──
  { patternId: 'ollie/pricing-table',                source: 'ollie/patterns/pricing-table.php',                      outputRelative: 'ollie/pricing-table.php',               category: 'pricing' },
  { patternId: 'ollie/pricing-table-3-column',       source: 'ollie/patterns/pricing-table-3-column.php',             outputRelative: 'ollie/pricing-table-3-column.php',      category: 'pricing' },
  { patternId: 'spectra-one/pricing',                source: 'spectra-one/patterns/pricing.php',                      outputRelative: 'spectra-one/pricing.php',               category: 'pricing' },
  { patternId: 'spectra-one/pricing-2',              source: 'spectra-one/patterns/pricing-2.php',                    outputRelative: 'spectra-one/pricing-2.php',             category: 'pricing' },

  // ── Testimonials (4) ──
  { patternId: 'ollie/testimonials-and-logos',       source: 'ollie/patterns/testimonials-and-logos.php',              outputRelative: 'ollie/testimonials-and-logos.php',      category: 'testimonials' },
  { patternId: 'ollie/single-testimonial',           source: 'ollie/patterns/single-testimonial.php',                 outputRelative: 'ollie/single-testimonial.php',          category: 'testimonials' },
  { patternId: 'spectra-one/testimonials',           source: 'spectra-one/patterns/testimonials.php',                 outputRelative: 'spectra-one/testimonials.php',          category: 'testimonials' },
  { patternId: 'tt4/testimonial-centered',           source: 'twentytwentyfour/patterns/testimonial-centered.php',    outputRelative: 'tt4/testimonial-centered.php',          category: 'testimonials' },

  // ── Headers (3) ──
  { patternId: 'ollie/header-light',                 source: 'ollie/patterns/header-light.php',                       outputRelative: 'ollie/header-light.php',                category: 'header' },
  { patternId: 'ollie/header-dark',                  source: 'ollie/patterns/header-dark.php',                        outputRelative: 'ollie/header-dark.php',                 category: 'header' },
  { patternId: 'tove/header-horizontal',             source: 'tove/patterns/header-horizontal.php',                   outputRelative: 'tove/header-horizontal.php',            category: 'header' },

  // ── Footers (3) ──
  { patternId: 'ollie/footer-light',                 source: 'ollie/patterns/footer-light.php',                       outputRelative: 'ollie/footer-light.php',                category: 'footer' },
  { patternId: 'ollie/footer-dark',                  source: 'ollie/patterns/footer-dark.php',                        outputRelative: 'ollie/footer-dark.php',                 category: 'footer' },
  { patternId: 'frost/footer-default',               source: 'frost/patterns/footer-default.php',                     outputRelative: 'frost/footer-default.php',              category: 'footer' },

  // ── Contact (3) ──
  { patternId: 'spectra-one/contact',                source: 'spectra-one/patterns/contact.php',                      outputRelative: 'spectra-one/contact.php',               category: 'contact' },
  { patternId: 'spectra-one/contact-2',              source: 'spectra-one/patterns/contact-2.php',                    outputRelative: 'spectra-one/contact-2.php',             category: 'contact' },
  { patternId: 'ollie/card-contact',                 source: 'ollie/patterns/card-contact.php',                       outputRelative: 'ollie/card-contact.php',                category: 'contact' },

  // ── About/Text (2) ──
  { patternId: 'ollie/large-text-and-text-boxes',    source: 'ollie/patterns/large-text-and-text-boxes.php',          outputRelative: 'ollie/large-text-and-text-boxes.php',   category: 'about' },
  { patternId: 'tt4/page-about-business',            source: 'twentytwentyfour/patterns/page-about-business.php',     outputRelative: 'tt4/page-about-business.php',           category: 'about' },

  // ── Team (2) ──
  { patternId: 'ollie/team-members',                 source: 'ollie/patterns/team-members.php',                       outputRelative: 'ollie/team-members.php',                category: 'team' },
  { patternId: 'tt4/team-4-col',                     source: 'twentytwentyfour/patterns/team-4-col.php',              outputRelative: 'tt4/team-4-col.php',                    category: 'team' },

  // ── Restaurant (2) ──
  { patternId: 'tove/restaurant-menu',               source: 'tove/patterns/restaurant-menu.php',                     outputRelative: 'tove/restaurant-menu.php',              category: 'restaurant' },
  { patternId: 'tove/restaurant-opening-hours',      source: 'tove/patterns/restaurant-opening-hours.php',            outputRelative: 'tove/restaurant-opening-hours.php',     category: 'restaurant' },
];

// ── Batch 2 (additional 50+ patterns) ─────────────────────────────────────────

const BATCH2: PatternJob[] = [
  // Heroes dark/light variants
  { patternId: 'ollie/hero-call-to-action-buttons-light', source: 'ollie/patterns/hero-call-to-action-buttons-light.php', outputRelative: 'ollie/hero-call-to-action-buttons-light.php', category: 'hero' },
  { patternId: 'ollie/hero-text-image-and-logos',    source: 'ollie/patterns/hero-text-image-and-logos.php',           outputRelative: 'ollie/hero-text-image-and-logos.php',   category: 'hero' },
  { patternId: 'spectra-one/hero-banner-2',          source: 'spectra-one/patterns/hero-banner-2.php',                outputRelative: 'spectra-one/hero-banner-2.php',         category: 'hero' },
  { patternId: 'spectra-one/hero-banner-3',          source: 'spectra-one/patterns/hero-banner-3.php',                outputRelative: 'spectra-one/hero-banner-3.php',         category: 'hero' },
  { patternId: 'spectra-one/hero-banner-4',          source: 'spectra-one/patterns/hero-banner-4.php',                outputRelative: 'spectra-one/hero-banner-4.php',         category: 'hero' },
  { patternId: 'spectra-one/hero-banner-5',          source: 'spectra-one/patterns/hero-banner-5.php',                outputRelative: 'spectra-one/hero-banner-5.php',         category: 'hero' },
  { patternId: 'spectra-one/hero-banner-6',          source: 'spectra-one/patterns/hero-banner-6.php',                outputRelative: 'spectra-one/hero-banner-6.php',         category: 'hero' },
  { patternId: 'tove/hero-cover',                    source: 'tove/patterns/hero-cover.php',                          outputRelative: 'tove/hero-cover.php',                   category: 'hero' },
  { patternId: 'tove/hero-text',                     source: 'tove/patterns/hero-text.php',                           outputRelative: 'tove/hero-text.php',                    category: 'hero' },
  { patternId: 'frost/hero-two-columns',             source: 'frost/patterns/hero-two-columns.php',                   outputRelative: 'frost/hero-two-columns.php',            category: 'hero' },

  // Features variety
  { patternId: 'ollie/feature-boxes-with-icon-dark', source: 'ollie/patterns/feature-boxes-with-icon-dark.php',       outputRelative: 'ollie/feature-boxes-with-icon-dark.php', category: 'features' },
  { patternId: 'ollie/image-and-numbered-features',  source: 'ollie/patterns/image-and-numbered-features.php',        outputRelative: 'ollie/image-and-numbered-features.php', category: 'features' },
  { patternId: 'spectra-one/feature-3',              source: 'spectra-one/patterns/feature-3.php',                    outputRelative: 'spectra-one/feature-3.php',             category: 'features' },
  { patternId: 'spectra-one/feature-4',              source: 'spectra-one/patterns/feature-4.php',                    outputRelative: 'spectra-one/feature-4.php',             category: 'features' },
  { patternId: 'spectra-one/feature-5',              source: 'spectra-one/patterns/feature-5.php',                    outputRelative: 'spectra-one/feature-5.php',             category: 'features' },
  { patternId: 'spectra-one/feature-6',              source: 'spectra-one/patterns/feature-6.php',                    outputRelative: 'spectra-one/feature-6.php',             category: 'features' },
  { patternId: 'spectra-one/feature-7',              source: 'spectra-one/patterns/feature-7.php',                    outputRelative: 'spectra-one/feature-7.php',             category: 'features' },
  { patternId: 'spectra-one/feature-8',              source: 'spectra-one/patterns/feature-8.php',                    outputRelative: 'spectra-one/feature-8.php',             category: 'features' },
  { patternId: 'tove/general-feature-large',         source: 'tove/patterns/general-feature-large.php',               outputRelative: 'tove/general-feature-large.php',        category: 'features' },

  // More CTAs
  { patternId: 'spectra-one/call-to-action-3',       source: 'spectra-one/patterns/call-to-action-3.php',             outputRelative: 'spectra-one/call-to-action-3.php',      category: 'cta' },
  { patternId: 'spectra-one/call-to-action-4',       source: 'spectra-one/patterns/call-to-action-4.php',             outputRelative: 'spectra-one/call-to-action-4.php',      category: 'cta' },
  { patternId: 'spectra-one/call-to-action-5',       source: 'spectra-one/patterns/call-to-action-5.php',             outputRelative: 'spectra-one/call-to-action-5.php',      category: 'cta' },
  { patternId: 'frost/cta-stacked',                  source: 'frost/patterns/cta-stacked.php',                        outputRelative: 'frost/cta-stacked.php',                 category: 'cta' },
  { patternId: 'frost/cta-button-dark',              source: 'frost/patterns/cta-button-dark.php',                    outputRelative: 'frost/cta-button-dark.php',             category: 'cta' },
  { patternId: 'frost/cta-stacked-dark',             source: 'frost/patterns/cta-stacked-dark.php',                   outputRelative: 'frost/cta-stacked-dark.php',            category: 'cta' },
  { patternId: 'tove/cta-horizontal',                source: 'tove/patterns/cta-horizontal.php',                      outputRelative: 'tove/cta-horizontal.php',               category: 'cta' },
  { patternId: 'tove/cta-vertical',                  source: 'tove/patterns/cta-vertical.php',                        outputRelative: 'tove/cta-vertical.php',                 category: 'cta' },
  { patternId: 'tt4/cta-subscribe-centered',         source: 'twentytwentyfour/patterns/cta-subscribe-centered.php',  outputRelative: 'tt4/cta-subscribe-centered.php',        category: 'cta' },

  // More Pricing
  { patternId: 'spectra-one/pricing-3',              source: 'spectra-one/patterns/pricing-3.php',                    outputRelative: 'spectra-one/pricing-3.php',             category: 'pricing' },
  { patternId: 'spectra-one/pricing-4',              source: 'spectra-one/patterns/pricing-4.php',                    outputRelative: 'spectra-one/pricing-4.php',             category: 'pricing' },
  { patternId: 'frost/pricing-three-columns',        source: 'frost/patterns/pricing-three-columns.php',              outputRelative: 'frost/pricing-three-columns.php',       category: 'pricing' },
  { patternId: 'frost/pricing-two-columns',          source: 'frost/patterns/pricing-two-columns.php',                outputRelative: 'frost/pricing-two-columns.php',         category: 'pricing' },
  { patternId: 'tove/general-pricing-table',         source: 'tove/patterns/general-pricing-table.php',               outputRelative: 'tove/general-pricing-table.php',        category: 'pricing' },

  // More Testimonials
  { patternId: 'ollie/testimonials-with-big-text',   source: 'ollie/patterns/testimonials-with-big-text.php',         outputRelative: 'ollie/testimonials-with-big-text.php',  category: 'testimonials' },
  { patternId: 'spectra-one/testimonials-2',         source: 'spectra-one/patterns/testimonials-2.php',               outputRelative: 'spectra-one/testimonials-2.php',        category: 'testimonials' },
  { patternId: 'spectra-one/testimonials-3',         source: 'spectra-one/patterns/testimonials-3.php',               outputRelative: 'spectra-one/testimonials-3.php',        category: 'testimonials' },
  { patternId: 'frost/testimonials',                 source: 'frost/patterns/testimonials.php',                       outputRelative: 'frost/testimonials.php',                category: 'testimonials' },
  { patternId: 'frost/testimonials-dark',            source: 'frost/patterns/testimonials-dark.php',                  outputRelative: 'frost/testimonials-dark.php',           category: 'testimonials' },
  { patternId: 'tove/general-testimonials-columns',  source: 'tove/patterns/general-testimonials-columns.php',        outputRelative: 'tove/general-testimonials-columns.php', category: 'testimonials' },

  // More Headers
  { patternId: 'ollie/header-light-with-buttons',    source: 'ollie/patterns/header-light-with-buttons.php',          outputRelative: 'ollie/header-light-with-buttons.php',   category: 'header' },
  { patternId: 'ollie/header-dark-with-buttons',     source: 'ollie/patterns/header-dark-with-buttons.php',           outputRelative: 'ollie/header-dark-with-buttons.php',    category: 'header' },
  { patternId: 'spectra-one/header',                 source: 'spectra-one/patterns/header.php',                       outputRelative: 'spectra-one/header.php',                category: 'header' },
  { patternId: 'frost/header-default',               source: 'frost/patterns/header-default.php',                     outputRelative: 'frost/header-default.php',              category: 'header' },

  // More Footers
  { patternId: 'ollie/footer-dark-centered',         source: 'ollie/patterns/footer-dark-centered.php',               outputRelative: 'ollie/footer-dark-centered.php',        category: 'footer' },
  { patternId: 'ollie/footer-light-centered',        source: 'ollie/patterns/footer-light-centered.php',              outputRelative: 'ollie/footer-light-centered.php',       category: 'footer' },
  { patternId: 'spectra-one/footer',                 source: 'spectra-one/patterns/footer.php',                       outputRelative: 'spectra-one/footer.php',                category: 'footer' },
  { patternId: 'frost/footer-three-columns',         source: 'frost/patterns/footer-three-columns.php',               outputRelative: 'frost/footer-three-columns.php',        category: 'footer' },
  { patternId: 'tove/footer-horizontal',             source: 'tove/patterns/footer-horizontal.php',                   outputRelative: 'tove/footer-horizontal.php',            category: 'footer' },
  { patternId: 'tt4/footer',                         source: 'twentytwentyfour/patterns/footer.php',                  outputRelative: 'tt4/footer.php',                        category: 'footer' },

  // More Contact
  { patternId: 'spectra-one/contact-3',              source: 'spectra-one/patterns/contact-3.php',                    outputRelative: 'spectra-one/contact-3.php',             category: 'contact' },
  { patternId: 'spectra-one/contact-4',              source: 'spectra-one/patterns/contact-4.php',                    outputRelative: 'spectra-one/contact-4.php',             category: 'contact' },
  { patternId: 'spectra-one/contact-5',              source: 'spectra-one/patterns/contact-5.php',                    outputRelative: 'spectra-one/contact-5.php',             category: 'contact' },

  // Restaurant extras
  { patternId: 'tove/restaurant-opening-hours-big',  source: 'tove/patterns/restaurant-opening-hours-big.php',        outputRelative: 'tove/restaurant-opening-hours-big.php', category: 'restaurant' },
  { patternId: 'tove/restaurant-reservation-big',    source: 'tove/patterns/restaurant-reservation-big.php',          outputRelative: 'tove/restaurant-reservation-big.php',   category: 'restaurant' },
  { patternId: 'tove/restaurant-featured-dish',      source: 'tove/patterns/restaurant-featured-dish.php',            outputRelative: 'tove/restaurant-featured-dish.php',     category: 'restaurant' },
  { patternId: 'tove/restaurant-location',           source: 'tove/patterns/restaurant-location.php',                 outputRelative: 'tove/restaurant-location.php',          category: 'restaurant' },

  // FAQ
  { patternId: 'spectra-one/faq',                    source: 'spectra-one/patterns/faq.php',                          outputRelative: 'spectra-one/faq.php',                   category: 'faq' },
  { patternId: 'spectra-one/faq-2',                  source: 'spectra-one/patterns/faq-2.php',                        outputRelative: 'spectra-one/faq-2.php',                 category: 'faq' },
  { patternId: 'tove/general-faq',                   source: 'tove/patterns/general-faq.php',                         outputRelative: 'tove/general-faq.php',                  category: 'faq' },
  { patternId: 'tt4/text-faq',                       source: 'twentytwentyfour/patterns/text-faq.php',                outputRelative: 'tt4/text-faq.php',                      category: 'faq' },

  // About extras
  { patternId: 'ollie/page-about',                   source: 'ollie/patterns/page-about.php',                        outputRelative: 'ollie/page-about.php',                  category: 'about' },
  { patternId: 'frost/page-about',                   source: 'frost/patterns/page-about.php',                        outputRelative: 'frost/page-about.php',                  category: 'about' },

  // Team extras
  { patternId: 'frost/team-four-columns',            source: 'frost/patterns/team-four-columns.php',                  outputRelative: 'frost/team-four-columns.php',           category: 'team' },

  // Blog
  { patternId: 'spectra-one/blog',                   source: 'spectra-one/patterns/blog.php',                         outputRelative: 'spectra-one/blog.php',                  category: 'blog' },
  { patternId: 'spectra-one/blog-2',                 source: 'spectra-one/patterns/blog-2.php',                       outputRelative: 'spectra-one/blog-2.php',                category: 'blog' },
  { patternId: 'spectra-one/blog-3',                 source: 'spectra-one/patterns/blog-3.php',                       outputRelative: 'spectra-one/blog-3.php',                category: 'blog' },

  // Newsletter
  { patternId: 'frost/newsletter-signup',            source: 'frost/patterns/newsletter-signup.php',                  outputRelative: 'frost/newsletter-signup.php',           category: 'newsletter' },
  { patternId: 'frost/newsletter-signup-dark',       source: 'frost/patterns/newsletter-signup-dark.php',             outputRelative: 'frost/newsletter-signup-dark.php',      category: 'newsletter' },
  { patternId: 'tt4/page-newsletter-landing',        source: 'twentytwentyfour/patterns/page-newsletter-landing.php', outputRelative: 'tt4/page-newsletter-landing.php',       category: 'newsletter' },

  // Gallery
  { patternId: 'tt4/gallery-offset-images-grid-2-col', source: 'twentytwentyfour/patterns/gallery-offset-images-grid-2-col.php', outputRelative: 'tt4/gallery-offset-images-grid-2-col.php', category: 'gallery' },
  { patternId: 'tt4/gallery-offset-images-grid-3-col', source: 'twentytwentyfour/patterns/gallery-offset-images-grid-3-col.php', outputRelative: 'tt4/gallery-offset-images-grid-3-col.php', category: 'gallery' },
  { patternId: 'tt4/gallery-offset-images-grid-4-col', source: 'twentytwentyfour/patterns/gallery-offset-images-grid-4-col.php', outputRelative: 'tt4/gallery-offset-images-grid-4-col.php', category: 'gallery' },

  // Numbers / Stats
  { patternId: 'frost/progress-bars',                source: 'frost/patterns/progress-bars.php',                      outputRelative: 'frost/progress-bars.php',               category: 'numbers' },
  { patternId: 'tt4/text-centered-statement',        source: 'twentytwentyfour/patterns/text-centered-statement.php', outputRelative: 'tt4/text-centered-statement.php',       category: 'numbers' },
  { patternId: 'tt4/text-centered-statement-small',  source: 'twentytwentyfour/patterns/text-centered-statement-small.php', outputRelative: 'tt4/text-centered-statement-small.php', category: 'numbers' },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function processJob(job: PatternJob): Promise<PatternManifest | null> {
  const src = path.join(CORES, job.source);
  if (!(await fs.pathExists(src))) {
    console.error(`  SKIP (missing): ${job.source}`);
    return null;
  }
  const source = await fs.readFile(src, 'utf8');
  const mapping = await loadMapping(job.category);
  const { result, replacements } = tokenize(source, mapping);

  const outPath = path.join(OUT, job.outputRelative);
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, result, 'utf8');

  // Verify block comments are byte-identical
  const origComments = (source.match(/<!--[\s\S]*?-->/g) || []);
  const tokenComments = (result.match(/<!--[\s\S]*?-->/g) || []);
  if (origComments.length !== tokenComments.length) {
    console.error(`  ⚠️  Block comment count mismatch: ${job.patternId}`);
  } else {
    for (let i = 0; i < origComments.length; i++) {
      if (origComments[i] !== tokenComments[i]) {
        console.error(`  ❌  Block comment MODIFIED in ${job.patternId} at index ${i}`);
      }
    }
  }

  return {
    patternId: job.patternId,
    source: job.source,
    output: `tokenized/${job.outputRelative}`,
    category: job.category,
    tokensUsed: Array.from(new Set(replacements.map(r => r.token))),
    replacements,
  };
}

async function main() {
  const allJobs = [...JOBS, ...BATCH2];
  console.log(`Tokenizing ${allJobs.length} patterns...\n`);

  const manifests: PatternManifest[] = [];
  let ok = 0;
  let skipped = 0;

  for (const job of allJobs) {
    process.stdout.write(`  ${job.patternId}...`);
    const m = await processJob(job);
    if (m) {
      manifests.push(m);
      console.log(` ✅ (${m.tokensUsed.length} tokens)`);
      ok++;
    } else {
      skipped++;
    }
  }

  const manifestPath = path.join(ROOT, 'pattern-library', 'batch-manifest.json');
  await fs.writeJson(manifestPath, { generated: new Date().toISOString(), patterns: manifests }, { spaces: 2 });

  console.log(`\nDone: ${ok} tokenized, ${skipped} skipped`);
  console.log(`Manifest: ${manifestPath}`);

  // Category summary
  const cats: Record<string, number> = {};
  for (const m of manifests) {
    cats[m.category] = (cats[m.category] || 0) + 1;
  }
  console.log('\nPer-category:');
  for (const [cat, count] of Object.entries(cats).sort()) {
    console.log(`  ${cat}: ${count}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

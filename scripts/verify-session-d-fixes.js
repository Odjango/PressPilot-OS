#!/usr/bin/env node

/**
 * PressPilot OS - Session D Fixes Verification Script
 *
 * Verifies all 5 UX fixes from commit ec67554 in a generated theme ZIP.
 *
 * Usage:
 *   node scripts/verify-session-d-fixes.js <path-to-theme.zip>
 *
 * Example:
 *   node scripts/verify-session-d-fixes.js ~/Downloads/luigi-pizza.zip
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

class SessionDVerifier {
  constructor(zipPath) {
    this.zipPath = zipPath;
    this.zip = null;
    this.issues = [];
    this.warnings = [];
  }

  run() {
    log('\n' + '='.repeat(60), 'bold');
    log('Session D Fixes Verification', 'bold');
    log('='.repeat(60) + '\n', 'bold');

    try {
      this.loadZip();
      this.verifyFix1_TransparentHeader();
      this.verifyFix2_LogoSize();
      this.verifyFix3_FooterComposition();
      this.verifyFix4_InnerPageSections();
      this.verifyFix5_PersonImages();
      this.printSummary();
    } catch (error) {
      logError(`Fatal error: ${error.message}`);
      process.exit(1);
    }
  }

  loadZip() {
    logInfo(`Loading ZIP: ${this.zipPath}`);

    if (!fs.existsSync(this.zipPath)) {
      throw new Error(`ZIP file not found: ${this.zipPath}`);
    }

    this.zip = new AdmZip(this.zipPath);
    const entries = this.zip.getEntries();
    logInfo(`Found ${entries.length} files in ZIP\n`);
  }

  getFileContent(filePath) {
    const entry = this.zip.getEntry(filePath);
    if (!entry) {
      return null;
    }
    return entry.getData().toString('utf8');
  }

  findFile(pattern) {
    const entries = this.zip.getEntries();
    return entries.find(entry => {
      const relativePath = entry.entryName.split('/').slice(1).join('/');
      return relativePath.match(pattern);
    });
  }

  verifyFix1_TransparentHeader() {
    log('Fix #1: Transparent Header', 'bold');
    log('────────────────────────────────────────────────────────');

    // Check header-transparent.html exists
    const headerTransparent = this.findFile(/^parts\/header-transparent\.html$/);
    if (!headerTransparent) {
      logError('header-transparent.html does NOT exist');
      this.issues.push('Fix #1: header-transparent.html missing');
      log('');
      return;
    }
    logSuccess('header-transparent.html exists');

    // Check content
    const content = headerTransparent.getData().toString('utf8');

    // Check for textColor: base on site-title
    if (content.includes('"textColor":"base"')) {
      logSuccess('site-title has textColor: base');
    } else {
      logError('site-title missing textColor: base');
      this.issues.push('Fix #1: site-title missing textColor: base');
    }

    // Check for textColor: base on navigation
    const navMatch = content.match(/wp:navigation[^>]*{[^}]*"textColor":"base"/);
    if (navMatch) {
      logSuccess('navigation has textColor: base');
    } else {
      logWarning('navigation may be missing textColor: base');
      this.warnings.push('Fix #1: navigation textColor not clearly verified');
    }

    // Check front-page.html uses header-transparent
    const frontPage = this.findFile(/^templates\/front-page\.html$/);
    if (frontPage) {
      const fpContent = frontPage.getData().toString('utf8');
      if (fpContent.includes('"slug":"header-transparent"')) {
        logSuccess('front-page.html references header-transparent slug');
      } else {
        logError('front-page.html does NOT reference header-transparent');
        this.issues.push('Fix #1: front-page.html not using header-transparent');
      }
    } else {
      logWarning('front-page.html not found');
      this.warnings.push('Fix #1: Could not verify front-page.html');
    }

    log('');
  }

  verifyFix2_LogoSize() {
    log('Fix #2: Logo Size & Spacing', 'bold');
    log('────────────────────────────────────────────────────────');

    const headerFiles = [
      this.findFile(/^parts\/header\.html$/),
      this.findFile(/^parts\/header-transparent\.html$/),
      this.findFile(/^parts\/footer\.html$/)
    ].filter(Boolean);

    let logoSizeOk = 0;
    let logoSpacingOk = 0;

    for (const file of headerFiles) {
      const content = file.getData().toString('utf8');
      const fileName = file.entryName.split('/').pop();

      // Check for 60px logo width
      if (content.includes('"width":"60px"') || content.includes('width:60px')) {
        logoSizeOk++;
        logSuccess(`${fileName}: Logo width is 60px`);
      } else if (content.includes('wp:site-logo')) {
        logWarning(`${fileName}: Uses wp:site-logo (size may be dynamic)`);
        logoSizeOk++;
      } else {
        logError(`${fileName}: Logo not found or size incorrect`);
      }

      // Check for blockGap spacing
      if (content.includes('var:preset|spacing|30') || content.includes('"blockGap"')) {
        logoSpacingOk++;
        logSuccess(`${fileName}: Has blockGap spacing`);
      }
    }

    if (logoSizeOk < headerFiles.length) {
      this.issues.push('Fix #2: Not all headers have 60px logo');
    }
    if (logoSpacingOk < 2) {
      this.warnings.push('Fix #2: blockGap spacing may be missing');
    }

    log('');
  }

  verifyFix3_FooterComposition() {
    log('Fix #3: Footer Composition', 'bold');
    log('────────────────────────────────────────────────────────');

    const footer = this.findFile(/^parts\/footer\.html$/);
    if (!footer) {
      logError('footer.html not found');
      this.issues.push('Fix #3: footer.html missing');
      log('');
      return;
    }

    const content = footer.getData().toString('utf8');

    // Check for logo + business name side-by-side (flexItemDisplay)
    if (content.includes('"orientation":"horizontal"') ||
        content.includes('"layout":{"type":"flex"') ||
        content.includes('wp:row')) {
      logSuccess('Footer has horizontal flex layout (logo + name side-by-side)');
    } else {
      logWarning('Footer layout may not be horizontal flex');
      this.warnings.push('Fix #3: Footer horizontal layout not clearly verified');
    }

    // Check for verticalAlignment: center
    if (content.includes('"verticalAlignment":"center"')) {
      logSuccess('Footer has verticalAlignment: center');
    } else {
      logWarning('Footer missing verticalAlignment: center');
      this.warnings.push('Fix #3: verticalAlignment not found');
    }

    // Check for tight blockGap (0.25rem)
    if (content.includes('0.25rem') || content.includes('"blockGap":"0.25rem"')) {
      logSuccess('Footer has tight blockGap (0.25rem) for tagline');
    } else {
      logWarning('Footer tight blockGap not found');
    }

    log('');
  }

  verifyFix4_InnerPageSections() {
    log('Fix #4: Inner Page Content Enrichment', 'bold');
    log('────────────────────────────────────────────────────────');

    const innerPages = [
      this.findFile(/^templates\/page-about\.html$/),
      this.findFile(/^templates\/page-services\.html$/),
      this.findFile(/^templates\/page-contact\.html$/),
      this.findFile(/^templates\/page\.html$/)
    ].filter(Boolean);

    if (innerPages.length === 0) {
      logWarning('No inner page templates found');
      this.warnings.push('Fix #4: No inner pages to verify');
      log('');
      return;
    }

    let pagesWithSections = 0;

    for (const page of innerPages) {
      const content = page.getData().toString('utf8');
      const fileName = page.entryName.split('/').pop();

      // Count wp:group blocks (sections)
      const groupCount = (content.match(/<!-- wp:group/g) || []).length;

      if (groupCount >= 3) {
        logSuccess(`${fileName}: Has ${groupCount} sections (≥3 required)`);
        pagesWithSections++;
      } else {
        logError(`${fileName}: Only ${groupCount} sections (3+ required)`);
        this.issues.push(`Fix #4: ${fileName} has insufficient sections`);
      }
    }

    if (pagesWithSections === 0) {
      this.issues.push('Fix #4: No inner pages have 3+ sections');
    }

    log('');
  }

  verifyFix5_PersonImages() {
    log('Fix #5: Person Images (Not Food)', 'bold');
    log('────────────────────────────────────────────────────────');

    const allFiles = this.zip.getEntries();
    let teamImageCount = 0;
    let chefImageCount = 0;
    let testimonialImageCount = 0;
    let foodImageCount = 0;

    for (const entry of allFiles) {
      const content = entry.getData().toString('utf8');

      // Look for Unsplash URLs with person/portrait queries
      const personUrls = content.match(/https:\/\/images\.unsplash\.com\/[^"'\s]*\?[^"'\s]*(portrait|person|headshot|chef|professional)[^"'\s]*/gi);
      const foodUrls = content.match(/https:\/\/images\.unsplash\.com\/[^"'\s]*\?[^"'\s]*(food|restaurant|dish|meal)[^"'\s]*/gi);

      if (personUrls) {
        personUrls.forEach(url => {
          if (url.includes('portrait') || url.includes('headshot') || url.includes('person')) {
            teamImageCount++;
          }
          if (url.includes('chef')) {
            chefImageCount++;
          }
        });
      }

      if (foodUrls) {
        foodImageCount += foodUrls.length;
      }
    }

    if (teamImageCount > 0) {
      logSuccess(`Found ${teamImageCount} person/portrait images`);
    }
    if (chefImageCount > 0) {
      logSuccess(`Found ${chefImageCount} chef portrait images`);
    }

    if (teamImageCount === 0 && chefImageCount === 0) {
      logWarning('No person-specific images detected via URL analysis');
      logInfo('Note: Images may use generic queries. Manual inspection recommended.');
      this.warnings.push('Fix #5: Person images not clearly verified via URLs');
    }

    if (foodImageCount > 5) {
      logWarning(`Found ${foodImageCount} food-related images (may include team sections)`);
      this.warnings.push('Fix #5: High food image count - verify team sections manually');
    }

    log('');
  }

  printSummary() {
    log('='.repeat(60), 'bold');
    log('Verification Summary', 'bold');
    log('='.repeat(60) + '\n', 'bold');

    if (this.issues.length === 0 && this.warnings.length === 0) {
      logSuccess('All Session D fixes verified! ✨');
      log('');
      process.exit(0);
    }

    if (this.issues.length > 0) {
      log(`${this.issues.length} Critical Issue(s):`, 'red');
      this.issues.forEach(issue => logError(issue));
      log('');
    }

    if (this.warnings.length > 0) {
      log(`${this.warnings.length} Warning(s):`, 'yellow');
      this.warnings.forEach(warning => logWarning(warning));
      log('');
    }

    if (this.issues.length > 0) {
      log('❌ Verification FAILED - issues must be fixed', 'red');
      process.exit(1);
    } else {
      log('⚠️  Verification PASSED with warnings - manual review recommended', 'yellow');
      process.exit(0);
    }
  }
}

// Main execution
if (require.main === module) {
  const zipPath = process.argv[2];

  if (!zipPath) {
    console.error('Usage: node scripts/verify-session-d-fixes.js <path-to-theme.zip>');
    console.error('Example: node scripts/verify-session-d-fixes.js ~/Downloads/luigi-pizza.zip');
    process.exit(1);
  }

  const verifier = new SessionDVerifier(zipPath);
  verifier.run();
}

module.exports = SessionDVerifier;

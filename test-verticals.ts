
import { generateTheme } from './src/generator';
import fs from 'fs-extra';
import path from 'path';

async function runTests() {
    console.log("🚀 Starting Vertical Extraction Strategy Verification...");

    // 1. Restaurant Test
    console.log("\n--- TEST A: Restaurant (Tove Logic) ---");
    const restaurantResult = await generateTheme({
        data: {
            name: "Luigi's Kitchen",
            industry: "restaurant",
            hero_headline: "Authentic Italian Pizza",
            hero_subheadline: "Hand-tossed and stone-baked to perfection.",
            menus: [
                {
                    title: "Dinner Menu",
                    items: [
                        { name: "Margherita", price: "$14", description: "Fresh basil and mozzarella" },
                        { name: "Pepperoni", price: "$16", description: "Spicy pepperoni and honey" }
                    ]
                }
            ]
        },
        slug: "test-restaurant"
    });

    console.log("✅ Restaurant Theme Generated:", restaurantResult.themeDir);

    // Check for Tove selection
    const siteInfoRes = await fs.readJson(path.join(restaurantResult.themeDir, 'site-info.json'));
    console.log("   Selected Base:", siteInfoRes.base);

    // Check for Menu Page
    const menuPagePath = path.join(restaurantResult.themeDir, 'templates', 'page-menu.html');
    const menuExists = await fs.pathExists(menuPagePath);
    console.log("   Menu Template Created:", menuExists ? "YES" : "NO");

    // Check Header Nav for Menu Link
    const headerPath = path.join(restaurantResult.themeDir, 'parts', 'header.html');
    const headerContent = await fs.readFile(headerPath, 'utf8');
    const hasMenuLink = headerContent.includes('url":"/menu"');
    console.log("   Nav contains /menu link:", hasMenuLink ? "YES" : "NO");


    // 2. E-Commerce Test
    console.log("\n--- TEST B: E-Commerce (Ollie + Shop Setup) ---");
    const shopResult = await generateTheme({
        data: {
            name: "EcoThreads",
            industry: "ecommerce",
            hero_headline: "Sustainable Fashion",
            hero_subheadline: "Ethically made clothing for a better planet."
        },
        slug: "test-ecommerce"
    });

    console.log("✅ E-Commerce Theme Generated:", shopResult.themeDir);

    // Check for Ollie selection
    const siteInfoShop = await fs.readJson(path.join(shopResult.themeDir, 'site-info.json'));
    console.log("   Selected Base:", siteInfoShop.base);

    // Check for WooCommerce Support in functions.php
    const functionsPath = path.join(shopResult.themeDir, 'functions.php');
    const functionsContent = await fs.readFile(functionsPath, 'utf8');
    const hasWooSupport = functionsContent.includes("add_theme_support('woocommerce')");
    console.log("   functions.php has WooCommerce support:", hasWooSupport ? "YES" : "NO");

    // Check for Shop Grid Pattern
    const shopPatternPath = path.join(shopResult.themeDir, 'patterns', 'shop-grid.php');
    const shopPatternExists = await fs.pathExists(shopPatternPath);
    console.log("   Shop Grid Pattern Injected:", shopPatternExists ? "YES" : "NO");

    // Check Header Nav for Shop Link
    const shopHeaderPath = path.join(shopResult.themeDir, 'parts', 'header.html');
    const shopHeaderContent = await fs.readFile(shopHeaderPath, 'utf8');
    const hasShopLink = shopHeaderContent.includes('url":"/shop"');
    console.log("   Nav contains /shop link:", hasShopLink ? "YES" : "NO");

    console.log("\n🏁 Vertical Extraction Test Completed.");
}

runTests().catch(err => {
    console.error("❌ Test Script Failed:", err);
    process.exit(1);
});

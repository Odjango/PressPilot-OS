/**
 * Test script to generate restaurant themes with sample menus
 * Run with: npx tsx scripts/generate-test-restaurants.ts
 */

import { generateTheme } from '../src/generator/index';
import path from 'path';

// Sample base64 logo (small red circle) for testing logo handling
const SAMPLE_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABhElEQVR4nO2ZsU7DMBCGvwpYGFhYWJAYeAJGBt6AhYGBgYWFhSdgZOANWBgYGFhYWBgYWFhYGBhY+gRUiEJpGsc+O3b/T7Jkxfb9d3aciw2BQCAQCNQRXArUA0ABHAKngE9gGzgCFoFH4BN4A26BK+AG+KkT4DuwBXwBs0A3MF8C94F3qk8UcZoB7gCngAdgHjisUALdALp4P9ALdONPATp5t6uZAR6AbeAIWKE+WZC3YnkNuADeA1/AHrBLPbIgb8XyFjiucNxfgb8k8AQ8BY6BVeoZWDi2wCEwAhwDx8AqtQt8D8T2gAPgCFilvoE/s2gKOARGgWNglXoHtoENYAo4BlaoJSAsO3EIDALHwAq1B4RlLQ6AI2AcOAaWqUNgWH5mEjgGpoFV6gMQliMxCIwCU8Ay9QEIy9EYBoaBQ2CYOgEEZW8MAwfACDAILFIfgKCciSFgEBgChqgvQFBuyhBwAJxS0b+TQUhPyj0wCPQBfVTsnwWBQCAQCATqjl+ZbcxmFOQQWQAAAABJRU5ErkJggg==';

async function main() {
    console.log('🍕 Generating Restaurant Theme 1: Italian Trattoria...\n');

    // Theme 1: Italian Restaurant (with logo)
    const theme1 = await generateTheme({
        base: 'ollie',
        mode: 'standard',
        slug: 'mama-mia-trattoria',
        data: {
            name: 'Mama Mia Trattoria',
            industry: 'restaurant',
            businessType: 'restaurant',
            logo: SAMPLE_LOGO_BASE64,
            hero_headline: 'Authentic Italian Cuisine',
            hero_subheadline: 'Family recipes passed down for generations since 1985',
            description: 'A cozy Italian restaurant serving homemade pasta, wood-fired pizzas, and classic desserts.',
            primary: '#C83C23',
            secondary: '#F5E6D3',
            accent: '#2D5016',
            pages: [
                { title: 'Home', slug: 'home', template: 'universal-home' as any },
                { title: 'Menu', slug: 'menu', template: 'universal-menu' as any },
                { title: 'About', slug: 'about', template: 'universal-about' as any },
                { title: 'Contact', slug: 'contact', template: 'universal-contact' as any },
            ],
            menus: [
                {
                    title: 'Appetizers',
                    items: [
                        { name: 'Bruschetta al Pomodoro', price: '$8.99', description: 'Toasted bread with fresh tomatoes, garlic, basil, and olive oil' },
                        { name: 'Calamari Fritti', price: '$12.99', description: 'Crispy fried calamari rings with marinara sauce' },
                        { name: 'Caprese Salad', price: '$10.99', description: 'Fresh mozzarella, tomatoes, basil, balsamic glaze' },
                        { name: 'Arancini', price: '$9.99', description: 'Crispy risotto balls stuffed with mozzarella' },
                    ]
                },
                {
                    title: 'Pasta',
                    items: [
                        { name: 'Spaghetti Carbonara', price: '$18.99', description: 'Guanciale, pecorino romano, egg, black pepper' },
                        { name: 'Fettuccine Alfredo', price: '$16.99', description: 'Creamy parmesan sauce with fresh fettuccine' },
                        { name: 'Lasagna della Nonna', price: '$19.99', description: 'Grandma\'s recipe with bolognese and béchamel' },
                        { name: 'Penne all\'Arrabbiata', price: '$15.99', description: 'Spicy tomato sauce with garlic and chili' },
                    ]
                },
                {
                    title: 'Wood-Fired Pizzas',
                    items: [
                        { name: 'Margherita', price: '$16.99', description: 'San Marzano tomatoes, fresh mozzarella, basil' },
                        { name: 'Quattro Formaggi', price: '$19.99', description: 'Mozzarella, gorgonzola, parmesan, fontina' },
                        { name: 'Diavola', price: '$18.99', description: 'Spicy salami, tomato, mozzarella, chili oil' },
                        { name: 'Prosciutto e Rucola', price: '$20.99', description: 'Prosciutto di Parma, arugula, shaved parmesan' },
                    ]
                },
                {
                    title: 'Desserts',
                    items: [
                        { name: 'Tiramisu', price: '$8.99', description: 'Classic espresso-soaked ladyfingers with mascarpone' },
                        { name: 'Panna Cotta', price: '$7.99', description: 'Vanilla cream with berry compote' },
                        { name: 'Cannoli Siciliani', price: '$6.99', description: 'Crispy shells filled with sweet ricotta' },
                    ]
                }
            ]
        }
    });

    console.log(`✅ Theme 1 generated: ${theme1.downloadPath}\n`);

    console.log('🍣 Generating Restaurant Theme 2: Japanese Sushi Bar...\n');

    // Theme 2: Japanese Sushi Restaurant (with logo)
    const theme2 = await generateTheme({
        base: 'frost',
        mode: 'standard',
        slug: 'sakura-sushi',
        data: {
            name: 'Sakura Sushi Bar',
            industry: 'restaurant',
            businessType: 'restaurant',
            logo: SAMPLE_LOGO_BASE64,
            hero_headline: 'Fresh Sushi & Japanese Cuisine',
            hero_subheadline: 'Experience the art of authentic Japanese cooking',
            description: 'Modern sushi bar offering fresh fish flown in daily from Tokyo\'s Tsukiji market.',
            primary: '#1A1A2E',
            secondary: '#FFB7C5',
            accent: '#E94560',
            pages: [
                { title: 'Home', slug: 'home', template: 'universal-home' as any },
                { title: 'Menu', slug: 'menu', template: 'universal-menu' as any },
                { title: 'About', slug: 'about', template: 'universal-about' as any },
                { title: 'Contact', slug: 'contact', template: 'universal-contact' as any },
            ],
            menus: [
                {
                    title: 'Appetizers',
                    items: [
                        { name: 'Edamame', price: '$6.00', description: 'Steamed soybeans with sea salt' },
                        { name: 'Gyoza', price: '$8.00', description: 'Pan-fried pork dumplings (6 pcs)' },
                        { name: 'Agedashi Tofu', price: '$7.00', description: 'Crispy tofu in dashi broth' },
                        { name: 'Takoyaki', price: '$9.00', description: 'Octopus balls with bonito flakes (6 pcs)' },
                    ]
                },
                {
                    title: 'Sashimi',
                    items: [
                        { name: 'Salmon Sashimi', price: '$16.00', description: 'Fresh Atlantic salmon (5 pcs)' },
                        { name: 'Tuna Sashimi', price: '$18.00', description: 'Premium bluefin tuna (5 pcs)' },
                        { name: 'Chef\'s Selection', price: '$28.00', description: 'Daily selection of 12 pieces' },
                        { name: 'Yellowtail Sashimi', price: '$17.00', description: 'Hamachi (5 pcs)' },
                    ]
                },
                {
                    title: 'Signature Rolls',
                    items: [
                        { name: 'Dragon Roll', price: '$18.00', description: 'Eel, cucumber, avocado, unagi sauce' },
                        { name: 'Rainbow Roll', price: '$19.00', description: 'California roll topped with assorted fish' },
                        { name: 'Spicy Tuna Roll', price: '$14.00', description: 'Tuna, spicy mayo, cucumber' },
                        { name: 'Sakura Special', price: '$24.00', description: 'Chef\'s signature creation with truffle' },
                        { name: 'Philadelphia Roll', price: '$13.00', description: 'Salmon, cream cheese, cucumber' },
                    ]
                },
                {
                    title: 'Hot Dishes',
                    items: [
                        { name: 'Chicken Teriyaki', price: '$16.00', description: 'Grilled chicken with teriyaki sauce and rice' },
                        { name: 'Beef Bulgogi', price: '$19.00', description: 'Korean-style marinated beef' },
                        { name: 'Tonkotsu Ramen', price: '$15.00', description: 'Rich pork broth with chashu and soft egg' },
                        { name: 'Unagi Don', price: '$22.00', description: 'Grilled eel over rice' },
                    ]
                }
            ]
        }
    });

    console.log(`✅ Theme 2 generated: ${theme2.downloadPath}\n`);

    console.log('=' .repeat(60));
    console.log('🎉 Both themes generated successfully!\n');
    console.log('Download locations:');
    console.log(`  1. Italian: ${theme1.downloadPath}`);
    console.log(`  2. Japanese: ${theme2.downloadPath}`);
    console.log('=' .repeat(60));
}

main().catch(console.error);

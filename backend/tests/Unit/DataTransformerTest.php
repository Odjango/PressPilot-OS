<?php

namespace Tests\Unit;

use App\Services\DataTransformer;
use Tests\TestCase;

class DataTransformerTest extends TestCase
{
    public function test_transforms_base_payload_with_default_pages(): void
    {
        $transformer = new DataTransformer;

        $input = [
            'brand' => [
                'business_name' => 'Acme Co',
                'business_tagline' => '',
                'business_category' => 'service',
            ],
            'narrative' => [
                'description_long' => 'Trusted business services.',
            ],
            'visualAssets' => [
                'logo_external_url' => 'https://example.com/logo-external.png',
            ],
            'modes' => [
                'restaurant' => [
                    'enabled' => false,
                ],
            ],
        ];

        $result = $transformer->transformSaaSInputToGeneratorData($input);

        $this->assertSame('Acme Co', $result['name']);
        $this->assertSame('Acme Co', $result['hero_headline']);
        $this->assertSame('Trusted business services.', $result['hero_subheadline']);
        $this->assertSame('corporate', $result['industry']);
        $this->assertSame('https://example.com/logo-external.png', $result['logo']);
        $this->assertCount(3, $result['pages']);
        $this->assertSame(['about', 'services', 'contact'], array_column($result['pages'], 'slug'));
        $this->assertArrayNotHasKey('menus', $result);
    }

    public function test_restaurant_mode_uses_menus_over_menu_sections_and_adds_menu_page(): void
    {
        $transformer = new DataTransformer;

        $input = [
            'brand' => [
                'business_name' => 'Harbor Table',
                'business_tagline' => 'Seasonal kitchen',
                'business_category' => 'restaurant_cafe',
            ],
            'narrative' => [
                'description_long' => 'Fine dining by the water.',
            ],
            'modes' => [
                'restaurant' => [
                    'enabled' => true,
                    'menus' => [
                        [
                            'name' => 'Dinner',
                            'items' => [
                                ['name' => 'Seared Salmon', 'price' => '$28', 'description' => 'Citrus glaze'],
                                ['price' => '$12'],
                            ],
                        ],
                    ],
                    'menu_sections' => [
                        [
                            'name' => 'Should Not Be Used',
                            'items' => [['name' => 'Ignored']],
                        ],
                    ],
                ],
            ],
        ];

        $result = $transformer->transformSaaSInputToGeneratorData($input);

        $this->assertSame('restaurant', $result['industry']);
        $this->assertContains('menu', array_column($result['pages'], 'slug'));
        $this->assertSame('Dinner', $result['menus'][0]['title']);
        $this->assertSame('Seared Salmon', $result['menus'][0]['items'][0]['name']);
        $this->assertSame('Unnamed Item', $result['menus'][0]['items'][1]['name']);
        $this->assertSame('$12', $result['menus'][0]['items'][1]['price']);
        $this->assertNotSame('Should Not Be Used', $result['menus'][0]['title']);
    }

    public function test_restaurant_mode_falls_back_to_default_menu_when_missing_inputs(): void
    {
        $transformer = new DataTransformer;

        $input = [
            'brand' => [
                'business_name' => 'Cafe Nova',
                'business_category' => 'restaurant_cafe',
            ],
            'narrative' => [
                'description_long' => 'Neighborhood cafe.',
            ],
            'modes' => [
                'restaurant' => [
                    'enabled' => true,
                    'menus' => [],
                    'menu_sections' => [],
                ],
            ],
        ];

        $result = $transformer->transformSaaSInputToGeneratorData($input);

        $this->assertSame('Main Menu', $result['menus'][0]['title']);
        $this->assertCount(3, $result['menus'][0]['items']);
        $this->assertSame('Appetizers', $result['menus'][0]['items'][0]['name']);
    }

    public function test_passes_visual_controls_and_contact_fields_and_overrides_logo_with_file_url(): void
    {
        $transformer = new DataTransformer;

        $input = [
            'brand' => [
                'business_name' => 'FlowPilot',
                'business_category' => 'saas_product',
            ],
            'narrative' => [
                'description_long' => 'Collaborative product updates.',
            ],
            'visualAssets' => [
                'logo_external_url' => 'https://example.com/logo-external.png',
                'logo_file_url' => '/tmp/logo-local.png',
            ],
            'visualControls' => [
                'custom_colors' => [
                    'primary' => '#112233',
                    'secondary' => '#445566',
                    'accent' => '#778899',
                ],
                'selectedPaletteId' => 'brand-kit',
                'userEditedBrandKit' => [
                    ['slot' => 'primary', 'hex' => '#112233'],
                ],
                'fontProfile' => 'modern',
                'heroLayout' => 'split',
                'brandStyle' => 'playful',
            ],
            'contact' => [
                'email' => 'hello@example.com',
                'phone' => '+1-555-0100',
                'address' => '123 Main St',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78701',
                'country' => 'USA',
                'openingHours' => ['Monday' => '9:00 AM - 5:00 PM'],
                'socialLinks' => ['instagram' => 'https://instagram.com/example'],
            ],
            'modes' => [
                'restaurant' => [
                    'enabled' => false,
                ],
            ],
        ];

        $result = $transformer->transformSaaSInputToGeneratorData($input);

        $this->assertSame('startup', $result['industry']);
        $this->assertSame('/tmp/logo-local.png', $result['logo']);
        $this->assertSame('#112233', $result['primary']);
        $this->assertSame('#445566', $result['secondary']);
        $this->assertSame('#778899', $result['accent']);
        $this->assertSame('brand-kit', $result['selectedPaletteId']);
        $this->assertSame('modern', $result['fontProfile']);
        $this->assertSame('split', $result['heroLayout']);
        $this->assertSame('playful', $result['brandStyle']);
        $this->assertSame('hello@example.com', $result['email']);
        $this->assertSame('Austin', $result['city']);
        $this->assertSame('9:00 AM - 5:00 PM', $result['openingHours']['Monday']);
        $this->assertSame('https://instagram.com/example', $result['socialLinks']['instagram']);
    }

    public function test_maps_bold_and_minimal_brand_style_to_modern_for_generator_compatibility(): void
    {
        $transformer = new DataTransformer;

        $base = [
            'brand' => [
                'business_name' => 'Brand Co',
                'business_category' => 'restaurant_cafe',
            ],
            'narrative' => [
                'description_long' => 'Desc',
            ],
            'modes' => [
                'restaurant' => [
                    'enabled' => true,
                ],
            ],
        ];

        $boldInput = $base;
        $boldInput['visualControls'] = ['brandStyle' => 'bold'];
        $bold = $transformer->transformSaaSInputToGeneratorData($boldInput);
        $this->assertSame('modern', $bold['brandStyle']);

        $minimalInput = $base;
        $minimalInput['visualControls'] = ['brandStyle' => 'minimal'];
        $minimal = $transformer->transformSaaSInputToGeneratorData($minimalInput);
        $this->assertSame('modern', $minimal['brandStyle']);

        $playfulInput = $base;
        $playfulInput['visualControls'] = ['brandStyle' => 'playful'];
        $playful = $transformer->transformSaaSInputToGeneratorData($playfulInput);
        $this->assertSame('playful', $playful['brandStyle']);
    }

    public function test_maps_business_categories_to_supported_site_types(): void
    {
        $transformer = new DataTransformer;

        $this->assertSame('restaurant', $transformer->mapBusinessCategoryToSiteType('restaurant_cafe'));
        $this->assertSame('restaurant', $transformer->mapBusinessCategoryToSiteType('food-truck'));
        $this->assertSame('restaurant', $transformer->mapBusinessCategoryToSiteType('cafe'));
        $this->assertSame('ecommerce', $transformer->mapBusinessCategoryToSiteType('e-commerce'));
        $this->assertSame('ecommerce', $transformer->mapBusinessCategoryToSiteType('shopify_store'));
        $this->assertSame('general', $transformer->mapBusinessCategoryToSiteType('saas_product'));
        $this->assertSame('general', $transformer->mapBusinessCategoryToSiteType(''));
    }
}

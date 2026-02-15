<?php

namespace App\Services;

class DataTransformer
{
    /**
     * Transform PressPilot SaaS API payload shape into generator input shape.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public function transformSaaSInputToGeneratorData(array $input): array
    {
        $businessName = data_get($input, 'brand.business_name', 'Untitled Project');
        $tagline = data_get($input, 'brand.business_tagline', '');
        $description = data_get($input, 'narrative.description_long', '');
        $category = (string) data_get($input, 'brand.business_category', 'service');
        $siteType = $this->mapBusinessCategoryToSiteType($category);

        $industryMap = [
            'restaurant_cafe' => 'restaurant',
            'ecommerce' => 'ecommerce',
            'saas_product' => 'startup',
            'local_store' => 'local',
            'service' => 'corporate',
            'other' => 'general',
        ];

        $industry = match ($siteType) {
            'restaurant' => 'restaurant',
            'ecommerce' => 'ecommerce',
            default => $industryMap[$category] ?? 'general',
        };

        $generatorData = [
            'name' => $businessName,
            'hero_headline' => $tagline ?: $businessName,
            'hero_subheadline' => $description,
            'industry' => $industry,
            'logo' => data_get($input, 'visualAssets.logo_external_url') ?: data_get($input, 'visualAssets.logo_file_url'),
        ];

        $pages = [
            [
                'title' => 'About',
                'slug' => 'about',
                'template' => 'universal-about',
                'content' => [
                    'hero_title' => "About {$businessName}",
                    'hero_sub' => $description,
                ],
            ],
            [
                'title' => 'Services',
                'slug' => 'services',
                'template' => 'universal-services',
                'content' => [
                    'hero_title' => 'Our Services',
                    'hero_sub' => "Discover what {$businessName} has to offer.",
                ],
            ],
            [
                'title' => 'Contact',
                'slug' => 'contact',
                'template' => 'universal-contact',
                'content' => [
                    'hero_title' => 'Get in Touch',
                    'hero_sub' => "Contact {$businessName} today.",
                ],
            ],
        ];

        if ($this->restaurantEnabled($input)) {
            $pages[] = [
                'title' => 'Menu',
                'slug' => 'menu',
                'template' => 'universal-menu',
                'content' => [
                    'hero_title' => 'Our Menu',
                    'hero_sub' => 'Fresh ingredients, expertly prepared.',
                ],
            ];
        }

        $generatorData['pages'] = $pages;

        if ($this->restaurantEnabled($input)) {
            $menus = data_get($input, 'modes.restaurant.menus');
            $menuSections = data_get($input, 'modes.restaurant.menu_sections');

            if (is_array($menus) && count($menus) > 0) {
                $generatorData['menus'] = array_map(
                    fn (array $menu): array => [
                        'title' => $menu['title'] ?? $menu['name'] ?? 'Menu',
                        'items' => array_map(
                            fn (array $item): array => [
                                'name' => $item['name'] ?? 'Unnamed Item',
                                'price' => $item['price'] ?? '',
                                'description' => $item['description'] ?? null,
                            ],
                            is_array($menu['items'] ?? null) ? $menu['items'] : []
                        ),
                    ],
                    array_values(array_filter($menus, 'is_array'))
                );
            } elseif (is_array($menuSections) && count($menuSections) > 0) {
                $generatorData['menus'] = array_map(
                    fn (array $section): array => [
                        'title' => $section['name'] ?? 'Menu',
                        'items' => array_map(
                            fn (array $item): array => [
                                'name' => $item['name'] ?? 'Unnamed Item',
                                'price' => $item['price'] ?? '',
                                'description' => $item['description'] ?? null,
                            ],
                            is_array($section['items'] ?? null) ? $section['items'] : []
                        ),
                    ],
                    array_values(array_filter($menuSections, 'is_array'))
                );
            } else {
                $generatorData['menus'] = [[
                    'title' => 'Main Menu',
                    'items' => [
                        ['name' => 'Appetizers', 'price' => '$8-12', 'description' => 'Fresh starters'],
                        ['name' => 'Main Courses', 'price' => '$18-28', 'description' => 'Signature dishes'],
                        ['name' => 'Desserts', 'price' => '$6-10', 'description' => 'Sweet endings'],
                    ],
                ]];
            }
        }

        $customColors = data_get($input, 'visualControls.custom_colors');
        if (is_array($customColors)) {
            if (array_key_exists('primary', $customColors)) {
                $generatorData['primary'] = $customColors['primary'];
            }
            if (array_key_exists('secondary', $customColors)) {
                $generatorData['secondary'] = $customColors['secondary'];
            }
            if (array_key_exists('accent', $customColors)) {
                $generatorData['accent'] = $customColors['accent'];
            }
        }

        $logoFileUrl = data_get($input, 'visualAssets.logo_file_url');
        if ($logoFileUrl) {
            $generatorData['logo'] = $logoFileUrl;
        }

        $selectedPaletteId = data_get($input, 'visualControls.selectedPaletteId');
        if ($selectedPaletteId) {
            $generatorData['selectedPaletteId'] = $selectedPaletteId;
        }

        $userEditedBrandKit = data_get($input, 'visualControls.userEditedBrandKit');
        if ($userEditedBrandKit) {
            $generatorData['userEditedBrandKit'] = $userEditedBrandKit;
        }

        $fontProfile = data_get($input, 'visualControls.fontProfile');
        if ($fontProfile) {
            $generatorData['fontProfile'] = $fontProfile;
        }

        $heroLayout = data_get($input, 'visualControls.heroLayout');
        if ($heroLayout) {
            $generatorData['heroLayout'] = $heroLayout;
        }

        $brandStyle = data_get($input, 'visualControls.brandStyle');
        if ($brandStyle) {
            $generatorData['brandStyle'] = $this->mapGeneratorBrandStyle((string) $brandStyle);
        }

        $contact = $input['contact'] ?? null;
        if (is_array($contact)) {
            $generatorData['email'] = $contact['email'] ?? null;
            $generatorData['phone'] = $contact['phone'] ?? null;
            $generatorData['address'] = $contact['address'] ?? null;
            $generatorData['city'] = $contact['city'] ?? null;
            $generatorData['state'] = $contact['state'] ?? null;
            $generatorData['zip'] = $contact['zip'] ?? null;
            $generatorData['country'] = $contact['country'] ?? null;
            $generatorData['openingHours'] = $contact['openingHours'] ?? null;
            $generatorData['socialLinks'] = $contact['socialLinks'] ?? null;
        }

        return $generatorData;
    }

    public function mapBusinessCategoryToSiteType(string $category): string
    {
        $normalized = strtolower(trim($category));
        if ($normalized === '') {
            return 'general';
        }

        $normalized = str_replace(['e-commerce', 'e_commerce'], 'ecommerce', $normalized);
        $tokens = preg_split('/[^a-z0-9]+/', $normalized, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        if (array_intersect($tokens, ['restaurant', 'cafe', 'food']) !== []) {
            return 'restaurant';
        }

        if (array_intersect($tokens, ['ecommerce', 'shop']) !== []) {
            return 'ecommerce';
        }

        return 'general';
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function restaurantEnabled(array $input): bool
    {
        return data_get($input, 'modes.restaurant.enabled') === true;
    }

    private function mapGeneratorBrandStyle(string $brandStyle): string
    {
        $normalized = strtolower(trim($brandStyle));

        return match ($normalized) {
            'playful', 'modern' => $normalized,
            'bold', 'minimal' => 'modern',
            default => 'modern',
        };
    }
}

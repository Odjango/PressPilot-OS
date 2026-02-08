<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        $name = $this->faker->company();

        return [
            'user_id' => (string) Str::uuid(),
            'name' => $name,
            'site_type' => 'general',
            'language' => 'en',
            'data' => [
                'name' => $name,
                'industry' => 'general',
                'hero_headline' => $this->faker->catchPhrase(),
                'hero_subheadline' => $this->faker->sentence(),
            ],
        ];
    }

    public function restaurant(): static
    {
        return $this->state(fn () => [
            'site_type' => 'restaurant_cafe',
            'data' => [
                'name' => $this->faker->company() . ' Restaurant',
                'industry' => 'restaurant',
                'hero_headline' => 'Welcome to Our Restaurant',
                'hero_subheadline' => $this->faker->sentence(),
            ],
        ]);
    }

    public function ecommerce(): static
    {
        return $this->state(fn () => [
            'site_type' => 'ecommerce',
            'data' => [
                'name' => $this->faker->company() . ' Shop',
                'industry' => 'ecommerce',
                'hero_headline' => 'Shop Our Collection',
                'hero_subheadline' => $this->faker->sentence(),
            ],
        ]);
    }
}

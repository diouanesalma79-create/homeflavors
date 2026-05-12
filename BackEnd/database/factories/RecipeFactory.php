<?php

namespace Database\Factories;

use App\Models\Recipe;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Recipe>
 */
class RecipeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->words(3, true);

        return [
            'user_id' => User::factory()->cook(),
            'title' => $title,
            'description' => fake()->paragraph(),
            'ingredients' => implode(',', fake()->words(10)),
            'instructions' => fake()->paragraphs(3, true),
            'price' => fake()->randomFloat(2, 10, 40),
            'image_url' => 'https://source.unsplash.com/600x400/?' . urlencode($title) . '+food',
            'category' => fake()->randomElement(['Italian', 'Moroccan', 'Asian', 'French', 'Mexican', 'Indian']),
            'city' => fake()->city(),
            'country' => fake()->country(),
            'continent' => fake()->randomElement(['Africa', 'Asia', 'Europe', 'NorthAmerica', 'SouthAmerica', 'Oceania']),
            'status' => 'approved',
        ];
    }
}

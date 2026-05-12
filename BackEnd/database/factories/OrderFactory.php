<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->customer(),
            'recipe_id' => Recipe::factory(),
            'quantity' => fake()->numberBetween(1, 5),
            'total_price' => fake()->randomFloat(2, 10, 200),
            'status' => fake()->randomElement(['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled']),
            'delivery_address' => fake()->address(),
            'notes' => fake()->optional(0.7)->randomElement([
                'Please leave it at the front door.',
                'No onions please.',
                'Call me when you arrive.',
                'Extra spicy!',
                'Gate code is 1234.',
                'Please bring napkins.',
                'Ring the bell twice.',
            ]),
        ];
    }
}

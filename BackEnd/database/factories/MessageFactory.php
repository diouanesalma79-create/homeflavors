<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sender_id' => User::factory()->customer(),
            'receiver_id' => User::factory()->cook(),
            'content' => fake()->randomElement([
                'Hello! Is this recipe available for delivery today?',
                'I really enjoyed the tagine, thank you!',
                'Could you please make it less spicy next time?',
                'What time will the order be ready?',
                'Do you offer any vegetarian alternatives for this?',
                'The food was amazing, definitely ordering again!',
                'Is there a gluten-free version of this dish?',
                'Can I pick up the order directly?',
            ]),
            'is_read' => fake()->boolean(),
        ];
    }
}

<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->orders() as $orderData) {
            $customer = $this->findUserOrFail($orderData['customer_email'], 'customer');
            $recipe = $this->findRecipeOrFail($orderData['recipe_title'], $orderData['cook_email']);
            $notes = "[seed-order:{$orderData['reference']}] {$orderData['notes']}";

            Order::updateOrCreate(
                ['notes' => $notes],
                [
                    'user_id' => $customer->id,
                    'recipe_id' => $recipe->id,
                    'quantity' => $orderData['quantity'],
                    'total_price' => round($recipe->price * $orderData['quantity'], 2),
                    'status' => $orderData['status'],
                    'delivery_address' => $orderData['delivery_address'],
                ]
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function orders(): array
    {
        return [
            [
                'reference' => 'HF-001',
                'customer_email' => 'visitor@homeflavors.com',
                'cook_email' => 'gordon@homeflavors.com',
                'recipe_title' => 'Beef Wellington',
                'quantity' => 2,
                'status' => 'accepted',
                'delivery_address' => '14 Rue des Fleurs, Casablanca',
                'notes' => 'Rare, please.',
            ],
            [
                'reference' => 'HF-002',
                'customer_email' => 'visitor@homeflavors.com',
                'cook_email' => 'choumicha@homeflavors.com',
                'recipe_title' => 'Royal Couscous with Seven Vegetables',
                'quantity' => 1,
                'status' => 'delivered',
                'delivery_address' => '22 Avenue Mohammed V, Rabat',
                'notes' => 'Extra tfaya if possible.',
            ],
            [
                'reference' => 'HF-003',
                'customer_email' => 'visitor@homeflavors.com',
                'cook_email' => 'moha@homeflavors.com',
                'recipe_title' => 'Tanjia Marrakshia',
                'quantity' => 3,
                'status' => 'preparing',
                'delivery_address' => '5 Rue de la Republique, Lyon',
                'notes' => 'Traditional style.',
            ],
        ];
    }

    private function findUserOrFail(string $email, string $role): User
    {
        $user = User::query()
            ->where('email', $email)
            ->where('role', $role)
            ->first();

        if (! $user) {
            throw new RuntimeException("Unable to seed orders because {$role} [{$email}] was not found.");
        }

        return $user;
    }

    private function findRecipeOrFail(string $title, string $cookEmail): Recipe
    {
        $recipe = Recipe::query()
            ->where('title', $title)
            ->whereHas('user', function ($query) use ($cookEmail): void {
                $query->where('email', $cookEmail);
            })
            ->first();

        if (! $recipe) {
            throw new RuntimeException("Unable to seed orders because recipe [{$title}] for [{$cookEmail}] was not found.");
        }

        return $recipe;
    }
}

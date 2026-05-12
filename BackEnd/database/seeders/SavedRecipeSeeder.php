<?php

namespace Database\Seeders;

use App\Models\Recipe;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class SavedRecipeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->savedRecipes() as $savedRecipeData) {
            $customer = $this->findCustomerOrFail($savedRecipeData['customer_email']);
            $recipe = $this->findRecipeOrFail($savedRecipeData['recipe_title'], $savedRecipeData['cook_email']);

            $customer->savedRecipes()->syncWithoutDetaching([$recipe->id]);
        }
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function savedRecipes(): array
    {
        return [
            [
                'customer_email' => 'visitor@homeflavors.com',
                'cook_email' => 'gordon@homeflavors.com',
                'recipe_title' => 'Beef Wellington',
            ],
            [
                'customer_email' => 'visitor@homeflavors.com',
                'cook_email' => 'choumicha@homeflavors.com',
                'recipe_title' => 'Royal Couscous with Seven Vegetables',
            ],
            [
                'customer_email' => 'visitor@homeflavors.com',
                'cook_email' => 'alain@homeflavors.com',
                'recipe_title' => 'Roasted Duck Breast with Honey',
            ],
        ];
    }

    private function findCustomerOrFail(string $email): User
    {
        $customer = User::query()
            ->where('email', $email)
            ->where('role', 'customer')
            ->first();

        if (! $customer) {
            throw new RuntimeException("Unable to seed saved recipes because customer [{$email}] was not found.");
        }

        return $customer;
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
            throw new RuntimeException("Unable to seed saved recipes because recipe [{$title}] for [{$cookEmail}] was not found.");
        }

        return $recipe;
    }
}

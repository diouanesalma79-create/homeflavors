<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database without dropping any existing data.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->call([
                UserSeeder::class,
                RecipeSeeder::class,
                OrderSeeder::class,
                MessageSeeder::class,
                SavedRecipeSeeder::class,
            ]);
        });
    }
}

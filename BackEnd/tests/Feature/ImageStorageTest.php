<?php

namespace Tests\Feature;

use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ImageStorageTest extends TestCase
{
    use RefreshDatabase;

    private function fakePng(string $name): \Illuminate\Http\Testing\File
    {
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='
        );

        return UploadedFile::fake()
            ->createWithContent($name, $png)
            ->mimeType('image/png');
    }

    public function test_recipe_upload_stores_file_on_public_disk_and_saves_relative_path(): void
    {
        Storage::fake('public');

        $chef = User::factory()->create([
            'role' => User::ROLE_CHEF,
            'status' => 'active',
        ]);

        Sanctum::actingAs($chef);

        $this->postJson('/api/recipes', [
            'title' => 'Test Recipe',
            'description' => 'A useful test recipe.',
            'ingredients' => 'Flour,Salt,Water',
            'instructions' => 'Mix and cook.',
            'price' => 12.50,
            'category' => 'Test',
            'image' => $this->fakePng('recipe.png'),
        ])->assertCreated();

        $recipe = Recipe::firstOrFail();

        $this->assertStringStartsWith('recipes/', $recipe->image_url);
        $this->assertFalse(str_starts_with($recipe->image_url, 'http://'));
        $this->assertFalse(str_starts_with($recipe->image_url, 'https://'));
        Storage::disk('public')->assertExists($recipe->image_url);
    }

    public function test_profile_upload_stores_file_on_public_disk_and_saves_relative_path(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => User::ROLE_CHEF,
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/profile', [
            'profile_picture' => $this->fakePng('profile.png'),
        ])->assertOk();

        $user->refresh();

        $this->assertStringStartsWith('profiles/', $user->profile_picture);
        $this->assertFalse(str_starts_with($user->profile_picture, 'http://'));
        $this->assertFalse(str_starts_with($user->profile_picture, 'https://'));
        Storage::disk('public')->assertExists($user->profile_picture);
    }
}

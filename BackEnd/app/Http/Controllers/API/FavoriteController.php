<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\RecipeResource;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Traits\ApiResponse;

class FavoriteController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the user's saved recipes.
     */
    public function index()
    {
        $user = Auth::user();
        $savedRecipes = $user->savedRecipes()->with('user')->paginate(12);

        return $this->success(RecipeResource::collection($savedRecipes)->response()->getData(true));
    }

    /**
     * Toggle saving/unsaving a recipe.
     */
    public function toggle(Recipe $recipe)
    {
        $user = Auth::user();
        
        $exists = $user->savedRecipes()->where('recipe_id', $recipe->id)->exists();

        if ($exists) {
            $user->savedRecipes()->detach($recipe->id);
            return $this->success(['saved' => false], 'Recipe removed from favorites');
        } else {
            $user->savedRecipes()->attach($recipe->id);
            return $this->success(['saved' => true], 'Recipe added to favorites');
        }
    }
}

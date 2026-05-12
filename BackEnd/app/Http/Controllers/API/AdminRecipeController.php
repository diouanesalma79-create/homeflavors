<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\RecipeResource;
use App\Models\Recipe;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class AdminRecipeController extends Controller
{
    use ApiResponse;

    /**
     * Get all pending recipes.
     */
    public function index()
    {
        $recipes = Recipe::with('user')->where('status', 'pending')->latest()->paginate(20);
        return $this->success(RecipeResource::collection($recipes)->response()->getData(true), 'Pending recipes retrieved successfully');
    }

    /**
     * Approve a recipe.
     */
    public function approve(Recipe $recipe)
    {
        $recipe->update(['status' => 'approved']);
        return $this->success(new RecipeResource($recipe->load('user')), 'Recipe approved successfully');
    }

    /**
     * Reject a recipe.
     */
    public function reject(Recipe $recipe)
    {
        $recipe->update(['status' => 'rejected']);
        return $this->success(new RecipeResource($recipe->load('user')), 'Recipe rejected successfully');
    }
}

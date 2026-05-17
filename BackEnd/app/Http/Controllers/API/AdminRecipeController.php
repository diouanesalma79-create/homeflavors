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
    public function index(Request $request)
    {
        $request->validate([
            'page' => 'sometimes|integer|min:1',
        ]);

        $recipes = Recipe::with('user')->where('status', 'pending')->latest()->paginate(20);
        return $this->success(RecipeResource::collection($recipes)->response()->getData(true), 'Pending recipes retrieved successfully');
    }

    /**
     * Approve a recipe.
     */
    public function approve(Request $request, Recipe $recipe)
    {
        $request->validate([
            '*' => 'prohibited',
        ]);

        $recipe->update(['status' => 'approved']);
        return $this->success(new RecipeResource($recipe->load('user')), 'Recipe approved successfully');
    }

    /**
     * Reject a recipe.
     */
    public function reject(Request $request, Recipe $recipe)
    {
        $request->validate([
            '*' => 'prohibited',
        ]);

        $recipe->update(['status' => 'rejected']);
        return $this->success(new RecipeResource($recipe->load('user')), 'Recipe rejected successfully');
    }
}

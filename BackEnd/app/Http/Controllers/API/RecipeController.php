<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\RecipeResource;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Traits\ApiResponse;

class RecipeController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Recipe::with('user')->where('status', 'approved')->whereHas('user', function ($q) {
            $q->where('role', 'cook')->where('status', 'active');
        });

        // Filter by Category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by City
        if ($request->has('city') && $request->city !== '') {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Filter by Chef Name
        if ($request->has('chef_name') && $request->chef_name !== '') {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->chef_name . '%');
            });
        }

        // Filter by Price Range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Search by Title
        if ($request->has('search') && $request->search !== '') {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by Continent
        if ($request->has('continent') && $request->continent !== 'all') {
            $query->where('continent', $request->continent);
        }

        // Mood Filter
        if ($request->has('mood')) {
            $mood = $request->mood;
            if ($mood === 'quick') {
                $query->where('prep_time_minutes', '<=', 30);
            } elseif ($mood === 'healthy') {
                $query->where('calories', '<=', 300);
            } elseif ($mood === 'top') {
                $query->orderBy('rating', 'desc')->orderBy('likes', 'desc');
            }
        }

        $recipes = $query->latest()->paginate(12);

        return $this->success(RecipeResource::collection($recipes)->response()->getData(true), 'Recipes retrieved successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'        => 'required|string|max:255',
            'ingredients'  => 'required|string',
            'instructions' => 'required|string',
            'price'        => 'required|numeric|min:0',
            'image'        => 'nullable|image|max:3072',
            'prep_time'    => 'sometimes|integer|min:0',
        ]);

        $recipeData = [
            'title'             => $request->title,
            'description'       => $request->description,
            'ingredients'       => $request->ingredients,
            'instructions'      => $request->instructions,
            'price'             => $request->price,
            'category'          => $request->category,
            'status'            => 'pending',
            'prep_time_minutes' => $request->prep_time ?? 0,
            'calories'          => 150, // Default calories
        ];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('recipes', 'public');
            $recipeData['image_url'] = $path;
        }

        $recipe = Auth::user()->recipes()->create($recipeData);

        return $this->success(new RecipeResource($recipe->load('user')), 'Recipe created successfully', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Recipe $recipe)
    {
        $recipe->load('user');

        if ($recipe->status !== 'approved' || !$recipe->user || $recipe->user->role !== 'cook' || $recipe->user->status !== 'active') {
            return $this->error('Recipe not found', 404);
        }

        return $this->success(new RecipeResource($recipe));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Recipe $recipe)
    {
        if ($recipe->user_id !== Auth::id()) {
            return $this->error('Unauthorized', 403);
        }

        $request->validate([
            'title'        => 'sometimes|string|max:255',
            'description'  => 'sometimes|string',
            'ingredients'  => 'sometimes|string',
            'instructions' => 'sometimes|string',
            'price'        => 'sometimes|numeric|min:0',
            'category'     => 'sometimes|string',
            'image'        => 'nullable|image|max:3072',
            'prep_time'    => 'sometimes|integer|min:0',
        ]);

        $recipeData = $request->only([
            'title', 'description', 'ingredients', 'instructions', 'price', 'category',
        ]);

        if ($request->has('prep_time')) {
            $recipeData['prep_time_minutes'] = $request->prep_time;
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('recipes', 'public');
            $recipeData['image_url'] = $path;
        }

        $recipe->update($recipeData);

        return $this->success(new RecipeResource($recipe->load('user')), 'Recipe updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Recipe $recipe)
    {
        if ($recipe->user_id !== Auth::id()) {
            return $this->error('Unauthorized', 403);
        }

        $recipe->delete();

        return $this->success(null, 'Recipe deleted successfully');
    }

    /**
     * Get recipes for the authenticated cook.
     */
    public function myRecipes()
    {
        $recipes = Auth::user()->recipes()->latest()->paginate(10);
        return $this->success(RecipeResource::collection($recipes)->response()->getData(true));
    }

    /**
     * Get recipes for a specific chef.
     */
    public function chefRecipes(\App\Models\User $user)
    {
        if ($user->role !== 'cook' || $user->status !== 'active') {
            return $this->error('Chef not found', 404);
        }

        $recipes = $user->recipes()->where('status', 'approved')->latest()->paginate(12);
        return $this->success(RecipeResource::collection($recipes)->response()->getData(true), 'Chef recipes retrieved successfully');
    }
}

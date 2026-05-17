<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    use ApiResponse;

    public function message(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $message = trim($request->message);

        $recipes = Recipe::where('status', 'approved')
            ->where(function ($query) use ($message) {
                $query->where('title', 'like', '%' . $message . '%')
                    ->orWhere('ingredients', 'like', '%' . $message . '%')
                    ->orWhere('description', 'like', '%' . $message . '%');
            })
            ->limit(3)
            ->get(['id', 'title']);

        if ($recipes->isNotEmpty()) {
            $titles = $recipes->pluck('title')->join(', ', ' and ');
            $reply = "I found a few recipes that match: {$titles}. Open the recipe catalog to see the full details.";
        } else {
            $reply = "I received your message: \"{$message}\". Try searching the catalog with one main ingredient or cuisine style for better matches.";
        }

        return $this->success([
            'reply' => $reply,
            'suggestions' => $recipes,
        ], 'Assistant response generated');
    }
}

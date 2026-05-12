<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class AIChatController extends Controller
{
    use ApiResponse;

    private $cookingKeywords = [
        'egg', 'milk', 'chicken', 'rice', 'garlic', 'onion', 'potato', 'tomato', 'flour', 'sugar', 
        'salt', 'pepper', 'oil', 'butter', 'beef', 'pasta', 'bread', 'cheese', 'recipe', 'cook', 
        'bake', 'fry', 'boil', 'steam', 'grill', 'roast', 'ingredient', 'spices', 'herb', 'vegetable', 
        'fruit', 'meat', 'fish', 'seafood', 'sauce', 'soup', 'salad', 'dessert', 'cake', 'cookie', 
        'breakfast', 'lunch', 'dinner', 'snack', 'kitchen', 'chef', 'meal', 'food', 'how to make',
        'preparation', 'steps', 'cooking', 'method'
    ];

    /**
     * Handle AI Recipe Chat
     */
    public function chat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|min:2|max:500',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        $userInput = $request->message;

        // 1. Backend Filtering Layer
        if (!$this->isCookingRelated($userInput)) {
            return $this->error("This assistant only handles cooking and recipe-related questions.", 403);
        }

        // 2. Caching
        $cacheKey = 'ai_recipe_' . md5(strtolower($userInput));
        if (Cache::has($cacheKey)) {
            return $this->success(Cache::get($cacheKey));
        }

        // 3. OpenRouter API Call
        try {
            $apiKey = env('OPENROUTER_API_KEY');
            $model = env('OPENROUTER_MODEL', 'meta-llama/llama-3.1-8b-instruct:free');

            if (empty($apiKey) || $apiKey === 'sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
                return $this->error("AI Service is not configured. Please add your OpenRouter API Key.", 503);
            }

            $systemPrompt = "You are a professional chef AI assistant for a cooking platform.
You ONLY answer cooking-related questions.

Rules:
- If input is not related to food, ingredients, or recipes -> politely refuse and say 'This assistant only handles cooking and recipe-related queries.'
- When ingredients or cooking questions are given, return a structured JSON response with the following keys:
  'recipe': The name of the recipe.
  'ingredients': A clean array of ingredients.
  'steps': A numbered array of preparation steps.
  'tips': Optional cooking tips or suggestions.

Keep answers clear, structured, and focused solely on cooking.";

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'HTTP-Referer' => config('app.url'),
                'X-Title' => 'HomeFlavors AI Assistant',
            ])->timeout(30)->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userInput],
                ],
            ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                
                // Try to parse JSON from content
                $data = json_decode($content, true);

                // Fallback: If AI returned JSON inside markdown code blocks or as plain text
                if (!$data) {
                    preg_match('/\{.*\}/s', $content, $matches);
                    if (isset($matches[0])) {
                        $data = json_decode($matches[0], true);
                    }
                }

                // Ultimate Fallback: Treat as plain text steps
                if (!$data) {
                    $data = [
                        'recipe' => 'Suggested Recipe',
                        'ingredients' => [],
                        'steps' => explode("\n", $content),
                        'tips' => ''
                    ];
                }

                // Cache for 1 hour
                Cache::put($cacheKey, $data, 3600);

                return $this->success($data);
            }

            Log::error('OpenRouter API Error: ' . $response->body());
            return $this->error("The AI assistant is having some trouble 'cooking' your request. Please try again later.", 502);

        } catch (\Exception $e) {
            Log::error('AI Chat Exception: ' . $e->getMessage());
            return $this->error("An unexpected error occurred. Please try again.", 500);
        }
    }

    /**
     * Simple keyword-based filtering
     */
    private function isCookingRelated($input)
    {
        $input = strtolower($input);
        foreach ($this->cookingKeywords as $keyword) {
            if (str_contains($input, $keyword)) {
                return true;
            }
        }
        return false;
    }
}

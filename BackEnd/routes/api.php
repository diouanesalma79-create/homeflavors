<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\RecipeController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\AdminRecipeController;
use App\Http\Controllers\API\AdminUserController;
use App\Http\Controllers\API\AIChatController;
use App\Http\Controllers\API\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ─── Public Routes ──────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// AI Recipe Chat
Route::post('/chat-recipe', [AIChatController::class, 'chat']);

// Recipes (Browsing)
Route::get('/recipes', [RecipeController::class, 'index']);
Route::get('/recipes/{recipe}', [RecipeController::class, 'show']);

// Chef Profiles (Public)
Route::get('/chefs', [ProfileController::class, 'chefs']);
Route::get('/chefs/{user}', [ProfileController::class, 'show']);
Route::get('/chefs/{user}/recipes', [RecipeController::class, 'chefRecipes']);

// ─── Protected Routes ────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    
    // User Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // User Settings
    Route::post('/profile', [ProfileController::class, 'update']);
    
    // Recipe Management (Cooks Only)
    Route::middleware('role:cook')->group(function () {
        Route::post('/recipes', [RecipeController::class, 'store']);
        Route::put('/recipes/{recipe}', [RecipeController::class, 'update']);
        Route::delete('/recipes/{recipe}', [RecipeController::class, 'destroy']);
        Route::get('/my-recipes', [RecipeController::class, 'myRecipes']);

        // Chef Dashboard Stats (aggregated)
        Route::get('/chef/stats', [DashboardController::class, 'stats']);

        // Orders Management
        Route::get('/incoming-orders', [OrderController::class, 'cookOrders']);
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    });
    
    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{recipe}/toggle', [FavoriteController::class, 'toggle']);
    
    // Orders (Customer)

    Route::get('/my-orders', [OrderController::class, 'index']);
    
    // User Search (for starting conversations — returns cooks + customers, excludes self)
    Route::get('/users/search', [MessageController::class, 'searchUsers']);

    // Messaging
    Route::get('/conversations', [MessageController::class, 'index']);
    Route::get('/messages/{user}', [MessageController::class, 'show']);
    Route::post('/messages', [MessageController::class, 'store']);
    
    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/stats', [DashboardController::class, 'adminStats']);
        Route::get('/recipes/pending', [AdminRecipeController::class, 'index']);
        Route::patch('/recipes/{recipe}/approve', [AdminRecipeController::class, 'approve']);
        Route::patch('/recipes/{recipe}/reject', [AdminRecipeController::class, 'reject']);
        Route::get('/chefs/pending', [AdminUserController::class, 'pendingChefs']);
        Route::patch('/chefs/{user}/approve', [AdminUserController::class, 'approveChef']);
        Route::patch('/chefs/{user}/reject', [AdminUserController::class, 'rejectChef']);
        Route::get('/orders', [OrderController::class, 'adminOrders']);
        Route::patch('/orders/{order}/status', [OrderController::class, 'adminUpdateStatus']);
        Route::patch('/users/{user}/ban', [AdminUserController::class, 'ban']);
        Route::patch('/users/{user}/unban', [AdminUserController::class, 'unban']);
    });
});

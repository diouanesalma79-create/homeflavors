<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'ingredients',
        'instructions',
        'price',
        'image_url',
        'youtube_url',
        'category',
        'status',
        'city',
        'country',
        'continent',
        'prep_time_minutes',
        'calories',
        'rating',
        'likes',
    ];

    /**
     * Get the user (cook) that created the recipe.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the orders for this recipe.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the users who have saved this recipe.
     */
    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'saved_recipes')
                    ->withTimestamps();
    }
}

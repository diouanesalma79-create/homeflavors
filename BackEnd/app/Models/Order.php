<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'recipe_id',
        'quantity',
        'total_price',
        'status',
        'delivery_address',
        'notes',
    ];

    /**
     * Get the user (customer) who placed the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the recipe associated with the order.
     */
    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }
}

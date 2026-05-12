<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            // Foreign key to the user who placed the order (customer)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Foreign key to the recipe being ordered
            $table->foreignId('recipe_id')->constrained()->onDelete('cascade');
            
            $table->integer('quantity')->default(1);
            $table->decimal('total_price', 8, 2);
            $table->enum('status', ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'])->default('pending');
            $table->text('delivery_address');
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

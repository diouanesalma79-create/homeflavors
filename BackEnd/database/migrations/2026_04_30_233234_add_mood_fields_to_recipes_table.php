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
        Schema::table('recipes', function (Blueprint $table) {
            $table->integer('prep_time_minutes')->nullable();
            $table->integer('calories')->nullable();
            $table->decimal('rating', 3, 2)->default(0.0);
            $table->integer('likes')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->dropColumn(['prep_time_minutes', 'calories', 'rating', 'likes']);
        });
    }
};

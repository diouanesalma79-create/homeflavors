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
            $table->string('status')->default('pending')->change();
        });
        
        // Update any existing active/draft records to match the new flow
        \Illuminate\Support\Facades\DB::table('recipes')->where('status', 'active')->update(['status' => 'approved']);
        \Illuminate\Support\Facades\DB::table('recipes')->where('status', 'draft')->update(['status' => 'pending']);
        \Illuminate\Support\Facades\DB::table('recipes')->where('status', 'inactive')->update(['status' => 'rejected']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE recipes MODIFY COLUMN status ENUM('active', 'inactive', 'draft') DEFAULT 'active'");
    }
};

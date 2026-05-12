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
        Schema::table('users', function (Blueprint $table) {
            
            $table->enum('role', ['customer', 'cook', 'admin'])->default('customer')->after('email');
            $table->enum('status', ['active', 'inactive', 'pending'])->default('active')->after('role');
            $table->string('phone')->nullable()->after('status');
            $table->text('address')->nullable()->after('phone');
            $table->string('profile_picture')->nullable()->after('address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            
            $table->dropColumn(['role', 'status', 'phone', 'address', 'profile_picture']);
        });
    }
};

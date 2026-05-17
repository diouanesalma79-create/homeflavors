<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'nationality')) {
                $table->string('nationality')->nullable()->after('profile_picture');
            }
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('nationality');
            }
            if (!Schema::hasColumn('users', 'specialty')) {
                $table->string('specialty')->nullable()->after('bio');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = array_filter(['nationality', 'bio', 'specialty'], fn ($column) => Schema::hasColumn('users', $column));
            if ($columns) {
                $table->dropColumn($columns);
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'])->default('pending')->change();
        });
    }
};

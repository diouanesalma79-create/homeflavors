<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'city')) {
                $table->string('city')->nullable()->after('address');
            }

            if (! Schema::hasColumn('users', 'rating')) {
                $table->decimal('rating', 2, 1)->nullable()->after('specialty');
            }

            if (! Schema::hasColumn('users', 'experience_years')) {
                $table->unsignedTinyInteger('experience_years')->nullable()->after('rating');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = array_filter(
                ['city', 'rating', 'experience_years'],
                fn ($column) => Schema::hasColumn('users', $column)
            );

            if ($columns) {
                $table->dropColumn($columns);
            }
        });
    }
};

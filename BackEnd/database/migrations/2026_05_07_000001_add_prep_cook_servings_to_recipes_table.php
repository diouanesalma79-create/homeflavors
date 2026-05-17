<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            if (! Schema::hasColumn('recipes', 'prep_time')) {
                $table->unsignedInteger('prep_time')->nullable()->after('continent');
            }
            if (! Schema::hasColumn('recipes', 'cook_time')) {
                $table->unsignedInteger('cook_time')->nullable()->after('prep_time');
            }
            if (! Schema::hasColumn('recipes', 'servings')) {
                $table->unsignedInteger('servings')->nullable()->after('cook_time');
            }
        });
    }

    public function down(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $columns = array_filter(
                ['prep_time', 'cook_time', 'servings'],
                fn ($column) => Schema::hasColumn('recipes', $column)
            );

            if ($columns) {
                $table->dropColumn($columns);
            }
        });
    }
};


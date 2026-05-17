<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('users') || ! Schema::hasColumn('users', 'role')) {
            return;
        }

        // Temporarily allow legacy roles so we can normalize stored values.
        $this->allowRoles(['visitor', 'chef', 'customer', 'cook', 'admin'], 'visitor');

        DB::table('users')->where('role', 'customer')->update(['role' => 'visitor']);
        DB::table('users')->where('role', 'cook')->update(['role' => 'chef']);

        $this->allowRoles(['visitor', 'chef', 'admin'], 'visitor');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('users') || ! Schema::hasColumn('users', 'role')) {
            return;
        }

        $this->allowRoles(['visitor', 'chef', 'customer', 'cook'], 'customer');

        DB::table('users')->where('role', 'visitor')->update(['role' => 'customer']);
        DB::table('users')->where('role', 'chef')->update(['role' => 'cook']);

        $this->allowRoles(['customer', 'cook'], 'customer');
    }

    private function allowRoles(array $roles, string $default): void
    {
        if (! in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            return;
        }

        $quotedRoles = collect($roles)
            ->map(fn (string $role): string => "'" . str_replace("'", "''", $role) . "'")
            ->implode(', ');
        $quotedDefault = "'" . str_replace("'", "''", $default) . "'";

        DB::statement("ALTER TABLE users MODIFY role ENUM($quotedRoles) NOT NULL DEFAULT $quotedDefault");
    }
};

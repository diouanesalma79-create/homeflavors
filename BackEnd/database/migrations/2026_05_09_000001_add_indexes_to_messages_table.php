<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add performance indexes to the messages table.
     * Safeguard #9: indexes on sender_id, receiver_id, created_at
     * Compatible with Laravel 11 (no Doctrine dependency).
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->index('sender_id',   'messages_sender_id_index');
            $table->index('receiver_id', 'messages_receiver_id_index');
            $table->index('created_at',  'messages_created_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_sender_id_index');
            $table->dropIndex('messages_receiver_id_index');
            $table->dropIndex('messages_created_at_index');
        });
    }
};

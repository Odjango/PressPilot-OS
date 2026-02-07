<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * DOCUMENTATION ONLY — table already exists in Supabase.
 * DO NOT run against production database.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('projects')) {
            Schema::create('projects', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('user_id');
                $table->text('name');
                $table->text('site_type')->default('general');
                $table->text('language')->default('en');
                $table->jsonb('data')->nullable();
                $table->timestampTz('created_at')->default(DB::raw('now()'));
                $table->timestampTz('updated_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        // NEVER drop — table is shared with Next.js
    }
};

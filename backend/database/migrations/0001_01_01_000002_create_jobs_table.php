<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * DOCUMENTATION ONLY — table already exists in Supabase.
 * This is the BUSINESS jobs table, NOT Laravel's internal queue table.
 * DO NOT run against production database.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('jobs')) {
            Schema::create('jobs', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('project_id');
                $table->text('status');
                $table->text('type');
                $table->jsonb('result')->nullable();
                $table->timestampTz('created_at')->default(DB::raw('now()'));
                $table->timestampTz('updated_at')->nullable();

                $table->foreign('project_id')->references('id')->on('projects');
            });
        }
    }

    public function down(): void
    {
        // NEVER drop — table is shared with Next.js
    }
};

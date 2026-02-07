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
        if (! Schema::hasTable('generated_themes')) {
            Schema::create('generated_themes', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('job_id');
                $table->text('file_path');
                $table->text('status');
                $table->timestampTz('expires_at');
                $table->timestampTz('created_at')->default(DB::raw('now()'));
                // NOTE: No updated_at column

                $table->foreign('job_id')->references('id')->on('jobs');
            });
        }
    }

    public function down(): void
    {
        // NEVER drop — table is shared with Next.js
    }
};

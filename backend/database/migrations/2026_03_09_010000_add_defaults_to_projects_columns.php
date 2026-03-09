<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add DEFAULT values to site_type and language so project creation
        // doesn't fail when these fields aren't provided upfront.
        // The Studio wizard collects site_type in a later step.
        DB::statement("
            ALTER TABLE public.projects
                ALTER COLUMN site_type SET DEFAULT 'general'
        ");

        DB::statement("
            ALTER TABLE public.projects
                ALTER COLUMN language SET DEFAULT 'en'
        ");

        DB::statement("
            ALTER TABLE public.projects
                ALTER COLUMN data SET DEFAULT '{}'::jsonb
        ");

        logger()->info('Added DEFAULT values to projects.site_type, projects.language, projects.data');
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE public.projects ALTER COLUMN site_type DROP DEFAULT");
        DB::statement("ALTER TABLE public.projects ALTER COLUMN language DROP DEFAULT");
        DB::statement("ALTER TABLE public.projects ALTER COLUMN data DROP DEFAULT");
    }
};

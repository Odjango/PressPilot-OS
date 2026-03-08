<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Projects Table Unification Migration
 *
 * Migrates data from legacy `pp_projects` table to canonical `projects` table.
 * Extends `projects` schema with compatibility columns (slug, status, legacy_pp_project_id).
 * Maps owner_email → user_id via auth.users.
 *
 * Based on: Project Extras/test-output-runs/output/contracts/projects-unification-ddl.sql
 *
 * IMPORTANT: Run this migration in staging first to verify data mappings.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            BEGIN;

            -- ---------------------------------------------------------------------------
            -- 1) Extend canonical projects schema with legacy-compatible fields
            -- ---------------------------------------------------------------------------

            ALTER TABLE public.projects
                ADD COLUMN IF NOT EXISTS slug text,
                ADD COLUMN IF NOT EXISTS status text DEFAULT \'draft\',
                ADD COLUMN IF NOT EXISTS legacy_pp_project_id uuid;

            -- Enforce status normalization at DB layer
            ALTER TABLE public.projects
                DROP CONSTRAINT IF NOT EXISTS projects_status_check;

            ALTER TABLE public.projects
                ADD CONSTRAINT projects_status_check
                CHECK (status IN (\'draft\', \'active\', \'archived\', \'deleted\'));

            -- One slug per user (only when slug is present)
            CREATE UNIQUE INDEX IF NOT EXISTS projects_user_slug_unique_idx
                ON public.projects (user_id, slug)
                WHERE slug IS NOT NULL;

            -- Legacy ID should map to only one canonical row when present
            CREATE UNIQUE INDEX IF NOT EXISTS projects_legacy_pp_project_id_unique_idx
                ON public.projects (legacy_pp_project_id)
                WHERE legacy_pp_project_id IS NOT NULL;

            -- ---------------------------------------------------------------------------
            -- 2) Create quarantine table for rows that cannot be mapped to user_id
            -- ---------------------------------------------------------------------------

            CREATE TABLE IF NOT EXISTS public.projects_unification_orphans (
                pp_project_id uuid PRIMARY KEY,
                owner_email text NOT NULL,
                name text,
                slug text,
                status text,
                created_at timestamptz,
                reason text NOT NULL,
                captured_at timestamptz NOT NULL DEFAULT now()
            );

            -- ---------------------------------------------------------------------------
            -- 3) Backfill pp_projects rows that can map to auth.users by email
            -- ---------------------------------------------------------------------------

            WITH pp_norm AS (
                SELECT
                    p.id AS pp_project_id,
                    lower(trim(p.owner_email)) AS owner_email_norm,
                    p.owner_email,
                    p.name,
                    p.slug,
                    COALESCE(NULLIF(lower(trim(p.status)), \'\'), \'draft\') AS status_norm,
                    p.created_at
                FROM public.pp_projects p
            ),
            resolved AS (
                SELECT
                    pp.*,
                    u.id AS resolved_user_id
                FROM pp_norm pp
                LEFT JOIN auth.users u
                    ON lower(trim(u.email)) = pp.owner_email_norm
            ),
            insertable AS (
                SELECT *
                FROM resolved
                WHERE resolved_user_id IS NOT NULL
            )
            INSERT INTO public.projects (
                id,
                user_id,
                name,
                site_type,
                language,
                data,
                slug,
                status,
                legacy_pp_project_id,
                created_at,
                updated_at
            )
            SELECT
                gen_random_uuid(),
                i.resolved_user_id,
                COALESCE(NULLIF(i.name, \'\'), \'Untitled Project\'),
                \'general\',
                \'en\',
                \'{}\'::jsonb,
                i.slug,
                CASE
                    WHEN i.status_norm IN (\'draft\', \'active\', \'archived\', \'deleted\')
                        THEN i.status_norm
                    ELSE \'draft\'
                END,
                i.pp_project_id,
                COALESCE(i.created_at, now()),
                now()
            FROM insertable i
            ON CONFLICT (user_id, slug) WHERE slug IS NOT NULL
            DO UPDATE SET
                name = EXCLUDED.name,
                status = EXCLUDED.status,
                legacy_pp_project_id = EXCLUDED.legacy_pp_project_id,
                updated_at = now();

            -- ---------------------------------------------------------------------------
            -- 4) Capture unmapped rows for manual resolution (no auth.users match)
            -- ---------------------------------------------------------------------------

            INSERT INTO public.projects_unification_orphans (
                pp_project_id,
                owner_email,
                name,
                slug,
                status,
                created_at,
                reason
            )
            SELECT
                p.id,
                p.owner_email,
                p.name,
                p.slug,
                p.status,
                p.created_at,
                \'No matching auth.users.email for owner_email\'
            FROM public.pp_projects p
            LEFT JOIN auth.users u
                ON lower(trim(u.email)) = lower(trim(p.owner_email))
            WHERE u.id IS NULL
            ON CONFLICT (pp_project_id) DO NOTHING;

            -- ---------------------------------------------------------------------------
            -- 5) Compatibility view for staged app cutover (optional)
            -- ---------------------------------------------------------------------------

            CREATE OR REPLACE VIEW public.v_pp_projects_unified AS
            SELECT
                p.legacy_pp_project_id AS id,
                u.email AS owner_email,
                p.name,
                p.slug,
                p.status,
                p.created_at
            FROM public.projects p
            JOIN auth.users u ON u.id = p.user_id
            WHERE p.legacy_pp_project_id IS NOT NULL;

            COMMIT;
        ');

        // Log verification info
        $this->command->info('Projects unification complete.');
        $this->command->info('Run verification queries:');
        $this->command->info('  SELECT COUNT(*) AS pp_projects_total FROM public.pp_projects;');
        $this->command->info('  SELECT COUNT(*) AS mapped_into_projects FROM public.projects WHERE legacy_pp_project_id IS NOT NULL;');
        $this->command->info('  SELECT COUNT(*) AS orphan_count FROM public.projects_unification_orphans;');
    }

    public function down(): void
    {
        // DO NOT auto-reverse — data migration cannot be safely rolled back.
        // To rollback manually:
        // 1. DELETE FROM projects WHERE legacy_pp_project_id IS NOT NULL;
        // 2. DROP VIEW IF EXISTS v_pp_projects_unified;
        // 3. DROP TABLE IF EXISTS projects_unification_orphans;
        // 4. ALTER TABLE projects DROP COLUMN IF EXISTS slug, status, legacy_pp_project_id;
        $this->command->warn('Manual rollback required. See migration comments.');
    }
};

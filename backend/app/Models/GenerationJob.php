<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Eloquent model for the business `jobs` table.
 *
 * Named GenerationJob (not Job) to avoid collision with Laravel's
 * internal queue Job class. This table is NOT the Laravel queue
 * storage table — we use Redis for that (via Horizon).
 */
class GenerationJob extends Model
{
    use HasUuids;

    protected $table = 'jobs';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'project_id',
        'status',
        'type',
        'result',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'string',
            'project_id' => 'string',
            'result' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    public const TYPE_GENERATE = 'generate';
    public const TYPE_REGENERATE = 'regenerate';
    public const TYPE_CLEANUP = 'cleanup';

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function generatedTheme(): HasOne
    {
        return $this->hasOne(GeneratedTheme::class, 'job_id');
    }

    /**
     * Optimistic lock: claim a pending job for processing.
     * Returns true if this process won the claim.
     */
    public function claimForProcessing(): bool
    {
        $affected = static::where('id', $this->id)
            ->where('status', self::STATUS_PENDING)
            ->update([
                'status' => self::STATUS_PROCESSING,
                'updated_at' => now(),
            ]);

        if ($affected > 0) {
            $this->status = self::STATUS_PROCESSING;
            return true;
        }

        return false;
    }

    public function markCompleted(array $result): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'result' => $result,
            'updated_at' => now(),
        ]);
    }

    public function markFailed(string $error): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'result' => ['error' => $error],
            'updated_at' => now(),
        ]);
    }
}

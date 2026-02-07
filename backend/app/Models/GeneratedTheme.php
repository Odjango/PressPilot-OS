<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneratedTheme extends Model
{
    use HasUuids;

    protected $table = 'generated_themes';

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * This table has no updated_at column.
     * Setting this to null prevents Eloquent from writing to it.
     */
    const UPDATED_AT = null;

    protected $fillable = [
        'job_id',
        'file_path',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'string',
            'job_id' => 'string',
            'expires_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public const STATUS_ACTIVE = 'active';
    public const STATUS_ARCHIVED = 'archived';

    public function generationJob(): BelongsTo
    {
        return $this->belongsTo(GenerationJob::class, 'job_id');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}

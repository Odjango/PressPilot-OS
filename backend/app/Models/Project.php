<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'projects';
    public $timestamps = false;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'name',
        'site_type',
        'language',
        'tier',
        'data',
    ];

    protected $attributes = [
        'site_type' => 'general',
        'language' => 'en',
        'tier' => 'individual',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'string',
            'user_id' => 'string',
            'data' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function generationJobs(): HasMany
    {
        return $this->hasMany(GenerationJob::class, 'project_id');
    }

    public function isAgency(): bool
    {
        return $this->tier === 'agency';
    }
}

<?php

namespace Tests\Unit;

use App\Jobs\UpgradeThemeImagesJob;
use Tests\TestCase;

class UpgradeThemeImagesJobTest extends TestCase
{
    public function test_job_properties(): void
    {
        $job = new UpgradeThemeImagesJob('fake-job-id');

        $this->assertEquals(1, $job->tries);
        $this->assertEquals(300, $job->timeout);
        $this->assertEquals('generate', $job->queue);
    }
}

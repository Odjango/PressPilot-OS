<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Force all API routes to return JSON errors (never HTML).
        // This prevents the Next.js proxy from forwarding HTML error pages
        // that the frontend cannot parse.
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                $status = $e instanceof HttpExceptionInterface
                    ? $e->getStatusCode()
                    : 500;

                $payload = [
                    'error' => $e->getMessage() ?: 'Internal Server Error',
                ];

                if (config('app.debug')) {
                    $payload['exception'] = get_class($e);
                    $payload['file'] = $e->getFile() . ':' . $e->getLine();
                    $payload['trace'] = array_slice(
                        array_map(fn ($frame) => ($frame['file'] ?? '?') . ':' . ($frame['line'] ?? '?'), $e->getTrace()),
                        0,
                        10
                    );
                }

                return response()->json($payload, $status);
            }
        });
    })
    ->create();

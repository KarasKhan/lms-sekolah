<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // [PENTING] Percaya Proxy Railway agar cookies 'Secure' bisa terkirim lewat HTTPS
        $middleware->trustProxies(at: '*');

        // Matikan CSRF Token untuk semua route (Kita pakai Sanctum Auth sebagai pengaman)
        $middleware->validateCsrfTokens(except: [
            '*',
        ]);

        // Aktifkan fitur API Stateful (untuk login berbasis cookie/session)
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
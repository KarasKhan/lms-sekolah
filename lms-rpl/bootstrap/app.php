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
        
        // --- TAMBAHKAN BARIS INI (PENTING) ---
        // Ini mendaftarkan middleware ForceCors agar jalan paling duluan
        $middleware->append(\App\Http\Middleware\ForceCors::class);
        // -------------------------------------

        $middleware->trustProxies(at: '*');

        $middleware->validateCsrfTokens(except: [
            '*',
        ]);
        
        // Pastikan ini dimatikan dulu biar ga ribet session
        // $middleware->statefulApi(); 
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
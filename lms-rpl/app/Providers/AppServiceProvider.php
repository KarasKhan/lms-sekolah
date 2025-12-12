<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Paksa gunakan HTTPS saat di Production (Railway)
        // Ini WAJIB untuk mengatasi error ERR_FAILED / CORS di Vercel
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }
}
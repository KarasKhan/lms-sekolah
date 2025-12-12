<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    // Pastikan path api/* dan login/register tercover
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    // --- BAGIAN PENTING: Masukkan URL Vercel Anda di sini ---
    'allowed_origins' => [
        'http://localhost:5173',                // Izin untuk Localhost (saat dev)
        'https://lms-smkn6.vercel.app',         // Izin untuk Frontend Vercel (Production)
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Ubah ke true agar cookie/token autentikasi bisa lewat
    'supports_credentials' => true,

];
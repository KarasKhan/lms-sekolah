<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    // Masukkan alamat Vercel Anda di sini
    'allowed_origins' => [
        'http://localhost:5173',                // Untuk development di laptop
        'https://lms-smkn6.vercel.app',         // URL Frontend Vercel Anda
        'https://lms-sekolah.vercel.app',       // (Opsional) Jika ada variasi URL lain
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Ubah menjadi true agar token/cookies bisa lewat
    'supports_credentials' => true, 

];
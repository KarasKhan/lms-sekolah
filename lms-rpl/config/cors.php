<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],
    'allowed_methods' => ['*'],

    // HANYA Izinkan URL Vercel Anda (Tanpa slash di akhir)
    'allowed_origins' => [
        'http://localhost:5173',
        'https://lms-smkn6.vercel.app', 
    ],

    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    
    // Wajib true
    'supports_credentials' => true,
];
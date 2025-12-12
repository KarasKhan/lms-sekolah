<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],
    'allowed_methods' => ['*'],

    // WAJIB PERSIS: Tanpa garis miring di belakang
    'allowed_origins' => [
        'http://localhost:5173',
        'https://lms-smkn6.vercel.app', 
    ],

    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Wajib true untuk login
];
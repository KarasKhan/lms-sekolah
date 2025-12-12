<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],
    'allowed_methods' => ['*'],

    // [UBAH INI] Pakai bintang biar Vercel manapun bisa masuk
    'allowed_origins' => ['*'], 

    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // [UBAH INI] Matikan credentials biar browser gak protes soal keamanan cookie
    'supports_credentials' => false, 
];
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    // Kosongkan yang spesifik
    'allowed_origins' => [],

    // [JURUS PAMUNGKAS] Pakai Bintang (*) di Pattern
    // Ini memaksa Laravel menerima request dari MANAPUN.
    'allowed_origins_patterns' => ['*'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
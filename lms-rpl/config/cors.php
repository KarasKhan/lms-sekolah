<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],
    'allowed_methods' => ['*'],

    'allowed_origins' => [], // Kosongkan ini
    'allowed_origins_patterns' => ['*'], // Gunakan Pattern Bintang (*)

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
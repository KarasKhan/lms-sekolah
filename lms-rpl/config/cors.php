<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],
    'allowed_methods' => ['*'],

    // [UBAH INI] Kosongkan yang spesifik
    'allowed_origins' => [],

    // [ISI INI] Gunakan Pola Bintang (*).
    // Laravel akan otomatis mendeteksi domain pengirim dan mengizinkannya,
    // Serta memperbolehkan Credentials/Login berjalan lancar.
    'allowed_origins_patterns' => ['*'],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    
    // Wajib true untuk login
    'supports_credentials' => true,
];
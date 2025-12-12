<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'], // <--- UBAH INI JADI BINTANG (Allow All)

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // <--- Pastikan ini juga bintang

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
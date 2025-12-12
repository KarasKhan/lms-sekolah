<?php

// --- START: MANUAL CORS FIX ---
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Daftar Domain yang Diizinkan (Tanpa slash di akhir)
$allowed_origins = [
    'http://localhost:5173',
    'https://lms-smkn6.vercel.app'
];

// Cek apakah origin pengirim ada di daftar
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
}

// Handle Preflight OPTIONS (Langsung Jawab OK & Stop)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, X-Token-Auth, Authorization, Accept, Application, X-XSRF-TOKEN");
        header("Access-Control-Allow-Credentials: true");
    }
    http_response_code(200);
    exit(0);
}
// --- END: MANUAL CORS FIX ---

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
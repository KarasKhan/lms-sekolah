<?php

// --- START: FRANKENPHP CORS FIX ---
// Menangani CORS secara manual sebelum masuk ke Laravel
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Daftar URL yang diizinkan (Tanpa garis miring di belakang)
$allowed_origins = [
    'http://localhost:5173',
    'https://lms-smkn6.vercel.app' 
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
}

// Handle Preflight Request (OPTIONS) - Langsung Jawab OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, X-Token-Auth, Authorization, Accept, Application, X-XSRF-TOKEN");
        header("Access-Control-Allow-Credentials: true");
    }
    http_response_code(200);
    exit(0); // Stop, jangan lanjut load Laravel
}
// --- END: CORS FIX ---

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
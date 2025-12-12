<?php

// --- START CONFIG CORS MANUAL (AMAN) ---
$allowedOrigins = [
    'http://localhost:5173',           // Izin buat laptop sendiri (Development)
    'https://lms-smkn6.vercel.app',    // Izin buat Vercel (Production)
];

// Cek apakah yang request ada di daftar "Teman"
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // Cache selama 1 hari
}

// Header standar lainnya
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, Application, X-XSRF-TOKEN');

// Handle Preflight (OPTIONS) biar cepat
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
    }
    http_response_code(200);
    exit();
}
// --- END CONFIG CORS MANUAL ---

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// ... (sisanya biarkan sama seperti bawaan Laravel)
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
<?php

// --- START: FRANKENPHP CORS FIX (JALUR KHUSUS) ---
// Kita tangani header CORS secara manual agar tidak diblokir server
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Masukkan URL Vercel Anda di sini (Tanpa garis miring di akhir)
$allowed_origins = [
    'http://localhost:5173',
    'https://lms-smkn6.vercel.app' 
];

// 1. Jika Origin dikenali, kirim header izin
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400"); // Cache 24 jam
}

// 2. Jika ini request Preflight (OPTIONS), langsung jawab OK dan stop.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, X-Token-Auth, Authorization, Accept, Application, X-XSRF-TOKEN");
        header("Access-Control-Allow-Credentials: true");
    }
    http_response_code(200);
    exit(0); // PENTING: Berhenti di sini agar tidak memuat Laravel
}
// --- END: FRANKENPHP CORS FIX ---

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
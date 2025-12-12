<?php

// --- [START] SOLUSI CORS MANUAL (WAJIB PALING ATAS) ---

// 1. Izinkan Siapapun (Vercel/Localhost)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // Cache 1 hari
}

// 2. Jika Browser tanya (OPTIONS), langsung jawab "BOLEH" dan STOP.
// Ini mencegah Laravel error/crash mempengaruhi izin CORS.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, Application, X-XSRF-TOKEN");
        header('Access-Control-Allow-Credentials: true');
    }
    // Langsung kirim status OK (200) dan matikan proses PHP.
    http_response_code(200);
    exit(0);
}
// --- [END] SOLUSI CORS MANUAL ---

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
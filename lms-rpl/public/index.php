<?php

// --- START: MANUAL CORS HANDLING (MIRROR STRATEGY) ---
// Logika: Jika ada request dari Origin manapun, kita izinkan & kirim balik header yang sesuai.
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // Cache 1 hari
}

// Handle Preflight Request (OPTIONS) -> Langsung OK biar cepat
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, Application, X-XSRF-TOKEN");
        header('Access-Control-Allow-Credentials: true');
    }
    exit(0); // Stop eksekusi, tidak perlu masuk Laravel
}
// --- END: MANUAL CORS HANDLING ---

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
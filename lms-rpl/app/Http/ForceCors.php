<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceCors
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Tangkap Request OPTIONS (Preflight)
        // Browser tanya: "Boleh kirim data gak?" Kita jawab: "BOLEH BANGET!" (200 OK)
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', '*') // Bintang = Bebas siapa aja
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN');
        }

        // 2. Lanjutkan proses ke Laravel (Login, Database, dll)
        $response = $next($request);

        // 3. Setelah selesai, tempel stiker "IZIN DITERIMA" di paket jawaban
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN');

        return $response;
    }
}
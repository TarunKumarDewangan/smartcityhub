<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Hospital;
use App\Models\Shop;
use App\Models\Service;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (!$query) {
            return response()->json([
                'hospitals' => [],
                'shops' => [],
                'services' => [],
            ]);
        }

        $hospitals = Hospital::where('name', 'LIKE', "%{$query}%")
            ->orWhere('address', 'LIKE', "%{$query}%")
            ->orWhere(function ($q) use ($query) {
                $q->where('has_emergency', true)
                  ->where('emergency_services', 'LIKE', "%{$query}%");
            })
            ->get();

        $shops = Shop::where('is_approved', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('category', 'LIKE', "%{$query}%")
                  ->orWhereHas('products', function ($pq) use ($query) {
                      $pq->where('name', 'LIKE', "%{$query}%")
                        ->orWhere('description', 'LIKE', "%{$query}%");
                  });
            })
            ->get();

        $services = Service::where('is_approved', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('category', 'LIKE', "%{$query}%");
            })
            ->get();

        return response()->json([
            'hospitals' => $hospitals,
            'shops' => $shops,
            'services' => $services,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use App\Models\Service;
use Illuminate\Http\Request;
use App\Http\Requests\StoreServiceRequestRequest;

class ServiceRequestController extends Controller
{
    public function store(StoreServiceRequestRequest $request)
    {
        $validated = $request->validated();

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'Pending';

        return ServiceRequest::create($validated);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'ServiceProvider') {
            $serviceIds = Service::where('provider_id', $user->id)->pluck('id');
            return ServiceRequest::whereIn('service_id', $serviceIds)
                ->with(['service', 'user'])
                ->latest()
                ->get();
        }

        return ServiceRequest::where('user_id', $user->id)->with('service')->latest()->get();
    }
}

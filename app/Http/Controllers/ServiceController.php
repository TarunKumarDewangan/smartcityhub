<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::where('is_approved', true)->where('is_available', true);

        if ($request->has('page') || $request->has('paginate')) {
            $perPage = $request->input('per_page', 15);
            return ServiceResource::collection($query->paginate($perPage));
        }

        return ServiceResource::collection($query->get());
    }

    public function myServices(Request $request)
    {
        return ServiceResource::collection(Service::where('provider_id', $request->user()->id)->get());
    }

    public function show(Service $service)
    {
        return new ServiceResource($service->load('provider'));
    }

    public function store(StoreServiceRequest $request)
    {
        $validated = $request->validated();
        $validated['provider_id'] = $request->user()->id;
        $validated['is_available'] = $request->has('is_available') ? $request->is_available : true;
        
        $service = Service::create($validated);
        return new ServiceResource($service);
    }

    public function update(UpdateServiceRequest $request, Service $service)
    {
        $validated = $request->validated();

        if ($request->user()->role !== 'Admin') {
            unset($validated['is_approved']);
        }

        $service->update($validated);
        return new ServiceResource($service);
    }

    public function destroy(Request $request, Service $service)
    {
        if ($service->provider_id !== $request->user()->id && $request->user()->role !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service->delete();
        return response()->json(['message' => 'Service deleted']);
    }
}

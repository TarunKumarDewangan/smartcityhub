<?php

namespace App\Http\Controllers;

use App\Models\Ambulance;
use Illuminate\Http\Request;
use App\Http\Requests\StoreAmbulanceRequest;
use App\Http\Requests\UpdateAmbulanceRequest;
use App\Http\Resources\AmbulanceResource;

class AmbulanceController extends Controller
{
    // Public routes handled in api.php
    // public function __construct()
    // {
    //     $this->middleware('auth:sanctum');
    // }

    private function checkAdmin()
    {
        if (auth()->user()->role !== 'Admin') {
            abort(403, 'Unauthorized. Admin only.');
        }
    }

    public function index()
    {
        return AmbulanceResource::collection(Ambulance::all());
    }

    public function store(StoreAmbulanceRequest $request)
    {
        $ambulance = Ambulance::create($request->validated());
        return new AmbulanceResource($ambulance);
    }

    public function update(UpdateAmbulanceRequest $request, Ambulance $ambulance)
    {
        $ambulance->update($request->validated());
        return new AmbulanceResource($ambulance);
    }

    public function destroy(Ambulance $ambulance)
    {
        $this->checkAdmin();
        $ambulance->delete();
        return response()->json(['message' => 'Ambulance deleted']);
    }
}

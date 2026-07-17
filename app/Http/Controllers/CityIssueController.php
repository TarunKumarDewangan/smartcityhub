<?php

namespace App\Http\Controllers;

use App\Models\CityIssue;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCityIssueRequest;
use App\Http\Requests\UpdateCityIssueRequest;
use App\Http\Resources\CityIssueResource;

class CityIssueController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role === 'Admin') {
            return CityIssueResource::collection(CityIssue::with('user')->latest()->get());
        }
        return CityIssueResource::collection(CityIssue::where('user_id', $request->user()->id)->latest()->get());
    }

    public function store(StoreCityIssueRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'Open';

        $cityIssue = CityIssue::create($validated);
        return new CityIssueResource($cityIssue);
    }

    public function show(CityIssue $cityIssue)
    {
        if (auth()->user()->role !== 'Admin' && $cityIssue->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return new CityIssueResource($cityIssue->load('user'));
    }

    public function update(UpdateCityIssueRequest $request, CityIssue $cityIssue)
    {
        $cityIssue->update($request->validated());
        return new CityIssueResource($cityIssue);
    }

    public function destroy(Request $request, CityIssue $cityIssue)
    {
        if ($request->user()->role !== 'Admin' && $cityIssue->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cityIssue->delete();
        return response()->json(['message' => 'City issue deleted']);
    }
}

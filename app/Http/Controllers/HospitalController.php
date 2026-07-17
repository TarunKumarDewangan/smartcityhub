<?php

namespace App\Http\Controllers;

use App\Models\Hospital;
use Illuminate\Http\Request;
use App\Http\Requests\StoreHospitalRequest;
use App\Http\Resources\HospitalResource;
use App\Http\Resources\DoctorResource;

class HospitalController extends Controller
{
    public function index(Request $request)
    {
        $query = Hospital::with('doctors');

        $user = auth('sanctum')->user();
        if ($user) {
            $query->leftJoin('favorite_hospitals', function ($join) use ($user) {
                $join->on('hospitals.id', '=', 'favorite_hospitals.hospital_id')
                     ->where('favorite_hospitals.user_id', '=', $user->id);
            })
            ->select('hospitals.*')
            ->selectRaw('CASE WHEN favorite_hospitals.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite_sort')
            ->orderBy('is_favorite_sort', 'desc');
        }

        $query->orderBy('hospitals.id', 'asc');

        if ($request->has('page') || $request->has('paginate')) {
            $perPage = $request->input('per_page', 15);
            return HospitalResource::collection($query->paginate($perPage));
        }

        return HospitalResource::collection($query->get());
    }

    public function show(Hospital $hospital)
    {
        return new HospitalResource($hospital->load('doctors'));
    }

    public function myHospital(Request $request)
    {
        $hospital = Hospital::where('user_id', $request->user()->id)->first();
        
        if (!$hospital) {
            return response()->json(['message' => 'No hospital assigned to this account'], 404);
        }
        
        return new HospitalResource($hospital->load('doctors'));
    }

    public function updateCrowd(Request $request)
    {
        $hospital = Hospital::where('user_id', $request->user()->id)->first();
        
        if (!$hospital) {
            return response()->json(['message' => 'No hospital assigned to this account'], 404);
        }

        $request->validate([
            'crowd_status' => 'required|in:Low,Medium,High',
        ]);

        $hospital->update(['crowd_status' => $request->crowd_status]);

        return response()->json([
            'message' => 'Crowd status updated successfully',
            'hospital' => new HospitalResource($hospital)
        ]);
    }

    public function doctors(Hospital $hospital)
    {
        return DoctorResource::collection($hospital->doctors);
    }

    public function store(StoreHospitalRequest $request)
    {
        $hospital = Hospital::create($request->validated());
        return new HospitalResource($hospital);
    }

    public function update(Request $request, Hospital $hospital)
    {
        // Check if user is Admin or owns this hospital
        if ($request->user()->role !== 'Admin' && $hospital->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'string',
            'address' => 'string',
            'crowd_status' => 'string|in:Low,Medium,High',
            'rating' => 'numeric|min:0|max:5',
            'representative_name' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'password' => 'nullable|string|min:6',
            'has_emergency' => 'nullable|boolean',
            'bed_count' => 'nullable|integer',
            'emergency_services' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $hospital->update([
            'name' => $validated['name'] ?? $hospital->name,
            'address' => $validated['address'] ?? $hospital->address,
            'crowd_status' => $validated['crowd_status'] ?? $hospital->crowd_status,
            'rating' => $validated['rating'] ?? $hospital->rating,
            'has_emergency' => isset($validated['has_emergency']) ? $validated['has_emergency'] : $hospital->has_emergency,
            'bed_count' => isset($validated['has_emergency']) && $validated['has_emergency'] ? ($validated['bed_count'] ?? $hospital->bed_count) : null,
            'emergency_services' => isset($validated['has_emergency']) && $validated['has_emergency'] ? ($validated['emergency_services'] ?? $hospital->emergency_services) : null,
            'latitude' => isset($validated['latitude']) ? $validated['latitude'] : $hospital->latitude,
            'longitude' => isset($validated['longitude']) ? $validated['longitude'] : $hospital->longitude,
        ]);

        if ($hospital->user_id) {
            $user = \App\Models\User::find($hospital->user_id);
            if ($user) {
                if (isset($validated['representative_name'])) {
                    $user->name = $validated['representative_name'];
                }
                if (isset($validated['email'])) {
                    if ($validated['email'] !== $user->email) {
                        $request->validate(['email' => 'unique:users,email']);
                    }
                    $user->email = $validated['email'];
                }
                if (isset($validated['phone'])) {
                    $user->phone = $validated['phone'];
                }
                if (!empty($validated['password'])) {
                    $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
                }
                $user->save();
            }
        }

        return new HospitalResource($hospital->load('doctors'));
    }

    public function destroy(Request $request, Hospital $hospital)
    {
        if ($request->user()->role !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $hospital->delete();
        return response()->json(['message' => 'Hospital deleted successfully']);
    }

    public function toggleFavorite(Request $request, Hospital $hospital)
    {
        $user = $request->user();
        
        $favorite = \DB::table('favorite_hospitals')
            ->where('user_id', $user->id)
            ->where('hospital_id', $hospital->id)
            ->first();

        if ($favorite) {
            \DB::table('favorite_hospitals')
                ->where('user_id', $user->id)
                ->where('hospital_id', $hospital->id)
                ->delete();
            $isFavorite = false;
            $message = 'Removed from favorites';
        } else {
            \DB::table('favorite_hospitals')->insert([
                'user_id' => $user->id,
                'hospital_id' => $hospital->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $isFavorite = true;
            $message = 'Added to favorites';
        }

        return response()->json([
            'message' => $message,
            'is_favorite' => $isFavorite
        ]);
    }
}

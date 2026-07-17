<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Hospital;
use Illuminate\Http\Request;
use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $hospital = Hospital::where('user_id', $request->user()->id)->first();
        
        if (!$hospital) {
            return response()->json(['message' => 'No hospital assigned'], 404);
        }

        return $hospital->doctors;
    }

    public function store(StoreDoctorRequest $request)
    {
        $hospital = Hospital::where('user_id', $request->user()->id)->first();
        
        if (!$hospital) {
            return response()->json(['message' => 'No hospital assigned'], 404);
        }

        $validated = $request->validated();
        $validated['hospital_id'] = $hospital->id;
        
        $doctor = Doctor::create($validated);

        return response()->json([
            'message' => 'Doctor added successfully',
            'doctor' => $doctor
        ]);
    }

    public function update(UpdateDoctorRequest $request, Doctor $hospitalDoctor)
    {
        $hospitalDoctor->update($request->validated());

        return response()->json([
            'message' => 'Doctor updated successfully',
            'doctor' => $hospitalDoctor
        ]);
    }

    public function destroy(Request $request, Doctor $hospitalDoctor)
    {
        $hospital = Hospital::where('user_id', $request->user()->id)->first();
        
        if (!$hospital || $hospitalDoctor->hospital_id !== $hospital->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $hospitalDoctor->delete();

        return response()->json(['message' => 'Doctor deleted successfully']);
    }
}

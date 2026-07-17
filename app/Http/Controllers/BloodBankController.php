<?php

namespace App\Http\Controllers;

use App\Models\BloodBank;
use Illuminate\Http\Request;
use App\Http\Requests\UpdateBloodBankRequest;
use App\Http\Resources\BloodBankResource;

class BloodBankController extends Controller
{
    public function index()
    {
        return BloodBankResource::collection(BloodBank::orderBy('name')->get());
    }

    public function myBloodBank(Request $request)
    {
        $bloodBank = BloodBank::where('user_id', $request->user()->id)->first();

        if (!$bloodBank) {
            return response()->json([
                'id'                   => null,
                'name'                 => '',
                'address'              => '',
                'contact'              => '',
                'blood_groups_available' => '',
                'user_id'              => $request->user()->id,
            ]);
        }

        return new BloodBankResource($bloodBank);
    }

    public function update(UpdateBloodBankRequest $request, $id)
    {
        $bloodBank = BloodBank::findOrFail($id);
        $bloodBank->update($request->validated());

        return response()->json([
            'message'    => 'Blood Bank updated successfully',
            'blood_bank' => new BloodBankResource($bloodBank),
        ]);
    }

    public function destroy($id)
    {
        $bloodBank = BloodBank::findOrFail($id);
        $bloodBank->delete();

        return response()->json(['message' => 'Blood Bank deleted successfully']);
    }
}

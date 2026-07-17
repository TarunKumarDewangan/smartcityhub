<?php

namespace App\Http\Controllers;

use App\Models\Helpline;
use Illuminate\Http\Request;
use App\Http\Resources\HelplineResource;

class HelplineController extends Controller
{
    public function index()
    {
        return HelplineResource::collection(Helpline::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'number' => 'required|string|max:20',
        ]);

        $helpline = Helpline::create($request->only('name', 'number'));

        return response()->json([
            'message'  => 'Helpline created successfully',
            'helpline' => new HelplineResource($helpline),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $helpline = Helpline::findOrFail($id);

        $request->validate([
            'name'   => 'sometimes|required|string|max:255',
            'number' => 'sometimes|required|string|max:20',
        ]);

        $helpline->update($request->only('name', 'number'));

        return response()->json([
            'message'  => 'Helpline updated successfully',
            'helpline' => new HelplineResource($helpline),
        ]);
    }

    public function destroy($id)
    {
        $helpline = Helpline::findOrFail($id);
        $helpline->delete();

        return response()->json(['message' => 'Helpline deleted successfully']);
    }
}

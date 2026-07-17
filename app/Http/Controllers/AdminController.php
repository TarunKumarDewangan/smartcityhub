<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Shop;
use App\Models\Service;
use App\Models\CityIssue;
use App\Models\Helpline;
use App\Models\BloodBank;
use App\Models\Hospital;
use App\Models\Ambulance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function pendingUsers()
    {
        $users = User::where('is_approved', false)
            ->where('role', '!=', 'User')
            ->get();
        return response()->json($users);
    }

    public function approveUser($id)
    {
        $user = User::findOrFail($id);
        $user->is_approved = true;
        $user->save();
        return response()->json(['message' => 'User approved successfully']);
    }

    public function pendingShops()
    {
        $shops = Shop::where('is_approved', false)->with('owner')->get();
        return response()->json($shops);
    }

    public function approveShop($id)
    {
        $shop = Shop::findOrFail($id);
        $shop->is_approved = true;
        $shop->save();
        return response()->json(['message' => 'Shop approved successfully']);
    }

    public function pendingServices()
    {
        $services = Service::where('is_approved', false)->with('provider')->get();
        return response()->json($services);
    }

    public function approveService($id)
    {
        $service = Service::findOrFail($id);
        $service->is_approved = true;
        $service->save();
        return response()->json(['message' => 'Service approved successfully']);
    }

    public function stats()
    {
        return response()->json([
            'users_pending'     => User::where('is_approved', false)->where('role', '!=', 'User')->count(),
            'shops_pending'     => Shop::where('is_approved', false)->count(),
            'services_pending'  => Service::where('is_approved', false)->count(),
            'total_users'       => User::count(),
            'total_shops'       => Shop::count(),
            'total_services'    => Service::count(),
            'total_hospitals'   => Hospital::count(),
            'total_helplines'   => Helpline::count(),
            'total_blood_banks' => BloodBank::count(),
            'open_issues'       => CityIssue::where('status', 'Open')->count(),
        ]);
    }

    public function allCityIssues(Request $request)
    {
        $issues = CityIssue::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($issue) => [
                'id'               => $issue->id,
                'type'             => $issue->type,
                'description'      => $issue->description,
                'status'           => $issue->status,
                'reporter_name'    => $issue->reporter_name,
                'reporter_phone'   => $issue->reporter_phone,
                'latitude'         => $issue->latitude,
                'longitude'        => $issue->longitude,
                'location_address' => $issue->location_address,
                'created_at'       => $issue->created_at,
                'reporter'         => $issue->user?->name ?? 'Anonymous',
            ]);

        return response()->json($issues);
    }

    public function updateIssueStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Open,In Progress,Resolved']);
        $issue = CityIssue::findOrFail($id);
        $issue->update(['status' => $request->status]);
        return response()->json(['message' => 'Issue status updated']);
    }

    public function deleteIssue($id)
    {
        CityIssue::findOrFail($id)->delete();
        return response()->json(['message' => 'Issue deleted']);
    }

    public function allUsers(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $query->orderBy('created_at', 'desc');

        if ($request->has('page') || $request->has('paginate')) {
            $perPage = $request->input('per_page', 15);
            return response()->json($query->paginate($perPage));
        }

        return response()->json($query->get());
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required_without:phone|string|email|max:255|unique:users',
            'phone' => 'required_without:email|string|max:15|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:User,Admin,ShopOwner,ServiceProvider,Hospital,BloodBank,AmbulanceDriver',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_approved' => true,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'sometimes|required|string|max:15|unique:users,phone,' . $user->id,
            'role' => 'sometimes|required|string|in:User,Admin,ShopOwner,ServiceProvider,Hospital,BloodBank,AmbulanceDriver',
            'is_approved' => 'sometimes|boolean',
            'password' => 'nullable|string|min:8',
        ]);

        if ((int) $id === (int) $request->user()->id) {
            unset($validated['role'], $validated['is_approved']);
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    public function deleteUser(Request $request, $id)
    {
        if ((int) $id === (int) $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        User::findOrFail($id)->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function createBloodBankProvider(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'bank_name' => 'required',
            'address' => 'required',
            'contact' => 'required'
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'BloodBank',
                'is_approved' => true
            ]);

            $bloodBank = BloodBank::create([
                'name' => $request->bank_name,
                'address' => $request->address,
                'contact' => $request->contact,
                'user_id' => $user->id
            ]);

            return response()->json([
                'message' => 'Blood Bank provider created successfully',
                'user' => $user,
                'blood_bank' => $bloodBank
            ]);
        });
    }

    public function createHospitalProvider(Request $request)
    {
        $request->validate([
            'name'               => 'required',
            'email'              => 'required|email|unique:users',
            'password'           => 'required|min:6',
            'hospital_name'      => 'required',
            'address'            => 'required',
            'has_emergency'      => 'boolean',
            'bed_count'          => 'nullable|integer|min:1',
            'emergency_services' => 'nullable|string',
            'latitude'           => 'nullable|numeric|between:-90,90',
            'longitude'          => 'nullable|numeric|between:-180,180',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'Hospital',
                'is_approved' => true
            ]);

            $hospital = Hospital::create([
                'name'               => $request->hospital_name,
                'address'            => $request->address,
                'user_id'            => $user->id,
                'crowd_status'       => 'Low',
                'has_emergency'      => $request->boolean('has_emergency', false),
                'bed_count'          => $request->has_emergency ? $request->bed_count : null,
                'emergency_services' => $request->has_emergency ? $request->emergency_services : null,
                'latitude'           => $request->latitude,
                'longitude'          => $request->longitude,
            ]);

            return response()->json([
                'message' => 'Hospital provider created successfully',
                'user' => $user,
                'hospital' => $hospital
            ]);
        });
    }
}

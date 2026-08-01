<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\BulkBlasterOtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function sendOtp(Request $request, BulkBlasterOtpService $otpService)
    {
        $request->validate([
            'phone' => 'required|string|max:15|unique:users',
        ]);

        try {
            $otpService->sendOtp($request->phone);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function register(Request $request, BulkBlasterOtpService $otpService)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required_without:phone|string|email|max:255|unique:users',
            'phone' => 'required_without:email|string|max:15|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:User,Admin,ShopOwner,ServiceProvider,HospitalAdmin,AmbulanceDriver',
            'otp' => 'required_with:phone|string',
        ]);

        if ($request->filled('phone')) {
            if (!$otpService->verifyOtp($request->phone, $request->otp)) {
                return response()->json(['message' => 'Invalid or expired verification code. Please request a new one.'], 422);
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_approved' => in_array($request->role, ['User', 'Admin']),
            'phone_verified_at' => $request->filled('phone') ? now() : null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required_without:phone|email',
            'phone' => 'required_without:email|string',
            'password' => 'required',
        ]);

        // Find user by email or phone
        $user = null;
        if ($request->email) {
            $user = User::where('email', $request->email)->first();
        } elseif ($request->phone) {
            $user = User::where('phone', $request->phone)->first();
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }

    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out from all devices'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}

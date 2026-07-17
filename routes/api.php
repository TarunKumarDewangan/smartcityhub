<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HospitalController;
use App\Http\Controllers\AmbulanceController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceRequestController;
use App\Http\Controllers\CityIssueController;
use App\Http\Controllers\HelplineController;
use App\Http\Controllers\BloodBankController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\CityAssistantController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DoctorController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Auth Routes
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public Data Routes (Read-only)
Route::get('/hospitals', [HospitalController::class, 'index']);
Route::get('/hospitals/{hospital}', [HospitalController::class, 'show']);
Route::get('/hospitals/{hospital}/doctors', [HospitalController::class, 'doctors']);

Route::get('/ambulances', [AmbulanceController::class, 'index']);
Route::get('/ambulances/{ambulance}', [AmbulanceController::class, 'show']);

Route::get('/helplines', [HelplineController::class, 'index']);
Route::get('/blood-banks', [BloodBankController::class, 'index']);


Route::get('/shops', [ShopController::class, 'index']);
Route::get('/shops/{shop}', [ShopController::class, 'show']);
Route::get('/shops/{shop}/products', [ShopController::class, 'products']);

Route::get('/services', [ServiceController::class, 'index']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);


Route::get('/services/{service}', [ServiceController::class, 'show']);

Route::get('/ratings', [RatingController::class, 'index']);
Route::get('/search', [GlobalSearchController::class, 'search']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/user', [AuthController::class, 'me']);

    // Hospital Management (POST/PUT/DELETE if needed)
    Route::post('/hospitals', [HospitalController::class, 'store']);
    Route::put('/hospitals/{hospital}', [HospitalController::class, 'update']);
    Route::delete('/hospitals/{hospital}', [HospitalController::class, 'destroy']);
    Route::post('/hospitals/{hospital}/favorite', [HospitalController::class, 'toggleFavorite']);

    // Ambulance Management
    Route::post('/ambulances', [AmbulanceController::class, 'store']);
    Route::put('/ambulances/{ambulance}', [AmbulanceController::class, 'update']);
    Route::delete('/ambulances/{ambulance}', [AmbulanceController::class, 'destroy']);

    // Shop Management
    Route::get('/my-shops', [ShopController::class, 'myShops']);
    Route::post('/shops', [ShopController::class, 'store']);
    Route::put('/shops/{shop}', [ShopController::class, 'update']);
    Route::delete('/shops/{shop}', [ShopController::class, 'destroy']);

    // Product Management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Service Requests & Issues
    Route::apiResource('service-requests', ServiceRequestController::class);
    Route::apiResource('city-issues', CityIssueController::class);

    // Service Management for Providers
    Route::get('/my-services', [ServiceController::class, 'myServices']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    // AI Assistant
    Route::post('/assistant', [CityAssistantController::class, 'ask']);

    // Ratings Submission
    Route::post('/ratings', [RatingController::class, 'store']);

    // Admin Routes
    Route::prefix('admin')->middleware('role:Admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/pending-users', [AdminController::class, 'pendingUsers']);
        Route::post('/approve-user/{id}', [AdminController::class, 'approveUser']);
        Route::get('/users', [AdminController::class, 'allUsers']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/pending-shops', [AdminController::class, 'pendingShops']);
        Route::post('/approve-shop/{id}', [AdminController::class, 'approveShop']);
        Route::get('/pending-services', [AdminController::class, 'pendingServices']);
        Route::post('/approve-service/{id}', [AdminController::class, 'approveService']);
        Route::post('/create-blood-bank', [AdminController::class, 'createBloodBankProvider']);
        Route::post('/create-hospital', [AdminController::class, 'createHospitalProvider']);
        // City Issues Management
        Route::get('/city-issues', [AdminController::class, 'allCityIssues']);
        Route::put('/city-issues/{id}/status', [AdminController::class, 'updateIssueStatus']);
        Route::delete('/city-issues/{id}', [AdminController::class, 'deleteIssue']);
    });

    // Helpline Admin CRUD
    Route::middleware('role:Admin')->group(function () {
        Route::post('/helplines', [HelplineController::class, 'store']);
        Route::put('/helplines/{id}', [HelplineController::class, 'update']);
        Route::delete('/helplines/{id}', [HelplineController::class, 'destroy']);

        // Blood Bank Admin Delete
        Route::delete('/blood-banks/{id}', [BloodBankController::class, 'destroy']);
    });

    // Blood Bank Management for Providers
    Route::get('/my-blood-bank', [BloodBankController::class, 'myBloodBank']);
    Route::put('/blood-banks/{id}', [BloodBankController::class, 'update']);

    // Hospital Management for Staff
    Route::get('/my-hospital', [HospitalController::class, 'myHospital']);
    Route::post('/hospital/update-crowd', [HospitalController::class, 'updateCrowd']);
    Route::apiResource('hospital-doctors', DoctorController::class);
});

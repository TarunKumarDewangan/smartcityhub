<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Shop;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreRatingRequest;

class RatingController extends Controller
{
    public function store(StoreRatingRequest $request)
    {
        $modelType = $request->ratable_type === 'shop' ? Shop::class : Product::class;
        $model = $modelType::findOrFail($request->ratable_id);

        // Update or create rating from this user for this item
        $rating = Rating::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'ratable_id' => $model->id,
                'ratable_type' => $modelType,
            ],
            [
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        return response()->json([
            'message' => 'Rating submitted successfully',
            'rating' => $rating,
            'average_rating' => $model->average_rating,
            'rating_count' => $model->rating_count
        ]);
    }

    public function index(Request $request)
    {
        $request->validate([
            'ratable_id' => 'required',
            'ratable_type' => 'required|in:shop,product',
        ]);

        $modelType = $request->ratable_type === 'shop' ? Shop::class : Product::class;
        
        $ratings = Rating::with('user')
            ->where('ratable_id', $request->ratable_id)
            ->where('ratable_type', $modelType)
            ->latest()
            ->get();

        return response()->json($ratings);
    }
}

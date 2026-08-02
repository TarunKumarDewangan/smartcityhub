<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Illuminate\Http\Request;
use App\Http\Requests\StoreShopRequest;
use App\Http\Requests\UpdateShopRequest;
use App\Http\Resources\ShopResource;
use App\Http\Resources\ProductResource;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $query = Shop::where('is_approved', true)
            ->withAvg('ratings', 'rating')
            ->withCount('ratings')
            ->with(['products' => function ($query) {
                $query->withAvg('ratings', 'rating')
                      ->withCount('ratings');
            }]);

        if ($request->has('page') || $request->has('paginate')) {
            $perPage = $request->input('per_page', 15);
            return ShopResource::collection($query->paginate($perPage));
        }

        return ShopResource::collection($query->get());
    }

    public function myShops(Request $request)
    {
        $shops = Shop::where('owner_id', $request->user()->id)
            ->withAvg('ratings', 'rating')
            ->withCount('ratings')
            ->get();
        return ShopResource::collection($shops);
    }

    public function show(Shop $shop)
    {
        $shop->loadAvg('ratings', 'rating')->loadCount('ratings');
        return new ShopResource($shop->load(['products' => function ($query) {
            $query->orderByDesc('is_featured')
                  ->withAvg('ratings', 'rating')
                  ->withCount('ratings');
        }]));
    }

    public function products(Shop $shop)
    {
        return ProductResource::collection($shop->products()->orderByDesc('is_featured')->get());
    }

    public function store(StoreShopRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('shops', 'public');
            $validated['image_url'] = rtrim(config('app.url'), '/') . '/storage/' . $path;
        }

        $validated['owner_id'] = $request->user()->id;
        $shop = Shop::create($validated);
        return new ShopResource($shop);
    }

    public function update(UpdateShopRequest $request, Shop $shop)
    {
        $validated = $request->validated();

        if ($request->user()->role !== 'Admin') {
            unset($validated['is_approved']);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('shops', 'public');
            $validated['image_url'] = rtrim(config('app.url'), '/') . '/storage/' . $path;
        }

        $shop->update($validated);
        return new ShopResource($shop);
    }

    public function destroy(Request $request, Shop $shop)
    {
        if ($shop->owner_id !== $request->user()->id && $request->user()->role !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $shop->delete();
        return response()->json(['message' => 'Shop deleted']);
    }
}

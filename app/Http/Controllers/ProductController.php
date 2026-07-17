<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Requests\DestroyProductRequest;
use App\Http\Resources\ProductResource;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('page') || $request->has('paginate')) {
            $perPage = $request->input('per_page', 15);
            return ProductResource::collection($query->paginate($perPage));
        }

        return ProductResource::collection($query->get());
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load('shop'));
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        if ($request->hasFile('image_2')) {
            $path2 = $request->file('image_2')->store('products', 'public');
            $validated['image_url_2'] = asset('storage/' . $path2);
        }

        $product = Product::create($validated);
        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        if ($request->hasFile('image_2')) {
            $path2 = $request->file('image_2')->store('products', 'public');
            $validated['image_url_2'] = asset('storage/' . $path2);
        }

        $product->update($validated);
        return new ProductResource($product);
    }

    public function destroy(DestroyProductRequest $request, Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}

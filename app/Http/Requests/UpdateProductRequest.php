<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Product;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $product = $this->route('product');
        if (!$product) {
            return false;
        }

        if (is_numeric($product)) {
            $product = Product::find($product);
        }

        if (!$product) {
            return false;
        }

        $shop = $product->shop;
        return $shop && ($shop->owner_id === $this->user()->id || $this->user()->role === 'Admin');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'string',
            'price' => 'numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'image_2' => 'nullable|image|max:2048',
            'is_featured' => 'boolean',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->boolean('is_featured')) {
                return;
            }

            $product = $this->route('product');
            if (is_numeric($product)) {
                $product = Product::find($product);
            }

            if (!$product || $product->is_featured) {
                return;
            }

            $featuredCount = Product::where('shop_id', $product->shop_id)
                ->where('is_featured', true)
                ->count();

            if ($featuredCount >= Product::MAX_FEATURED_PER_SHOP) {
                $validator->errors()->add(
                    'is_featured',
                    'You can only mark up to ' . Product::MAX_FEATURED_PER_SHOP . ' products as top selling. Un-mark another product first.'
                );
            }
        });
    }
}

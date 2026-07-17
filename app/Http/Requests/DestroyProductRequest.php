<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Product;

class DestroyProductRequest extends FormRequest
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
        return [];
    }
}

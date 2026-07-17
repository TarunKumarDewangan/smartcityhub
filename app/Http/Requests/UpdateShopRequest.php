<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Shop;

class UpdateShopRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $shop = $this->route('shop');
        if (!$shop) {
            return false;
        }
        if (is_numeric($shop)) {
            $shop = Shop::find($shop);
        }
        if (!$shop) {
            return false;
        }
        return $shop->owner_id === $this->user()->id || $this->user()->role === 'Admin';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'string',
            'category' => 'string',
            'description' => 'nullable|string',
            'address' => 'string',
            'contact_phone' => 'string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'image' => 'nullable|image|max:2048',
            'opening_days' => 'nullable|string',
            'opening_hours' => 'nullable|string',
        ];
    }
}

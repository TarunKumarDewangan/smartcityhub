<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'category' => 'required|string',
            'area' => 'required|string',
            'contact_phone' => 'required|string',
            'description' => 'nullable|string',
            'is_available' => 'boolean',
            'working_days' => 'nullable|string',
            'working_hours' => 'nullable|string',
        ];
    }
}

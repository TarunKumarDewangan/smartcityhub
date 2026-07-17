<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCityIssueRequest extends FormRequest
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
            'type'             => 'required|string',
            'description'      => 'required|string',
            'reporter_name'    => 'nullable|string|max:100',
            'reporter_phone'   => 'nullable|string|max:20',
            'latitude'         => 'nullable|numeric|between:-90,90',
            'longitude'        => 'nullable|numeric|between:-180,180',
            'location_address' => 'nullable|string|max:500',
        ];
    }
}

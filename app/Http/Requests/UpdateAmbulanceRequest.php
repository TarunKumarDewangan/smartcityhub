<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAmbulanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $role = $this->user()->role;
        return $role === 'Admin' || $role === 'AmbulanceDriver';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $ambulance = $this->route('ambulance');
        $ambulanceId = is_numeric($ambulance) ? $ambulance : ($ambulance?->id ?? '');

        if ($this->user()->role === 'AmbulanceDriver') {
            return [
                'status' => 'required|in:Available,Busy',
            ];
        }

        return [
            'name' => 'string',
            'contact' => 'string',
            'vehicle_number' => 'nullable|string|unique:ambulances,vehicle_number,' . $ambulanceId,
            'status' => 'in:Available,Busy',
        ];
    }
}

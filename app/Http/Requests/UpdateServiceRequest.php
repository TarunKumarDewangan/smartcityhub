<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Service;

class UpdateServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $service = $this->route('service');
        if (!$service) {
            return false;
        }
        if (is_numeric($service)) {
            $service = Service::find($service);
        }
        if (!$service) {
            return false;
        }
        return $service->provider_id === $this->user()->id || $this->user()->role === 'Admin';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'string',
            'category' => 'string',
            'area' => 'string',
            'contact_phone' => 'string',
            'description' => 'nullable|string',
            'is_available' => 'boolean',
            'working_days' => 'nullable|string',
            'working_hours' => 'nullable|string',
            'is_approved' => 'sometimes|boolean',
        ];
    }
}

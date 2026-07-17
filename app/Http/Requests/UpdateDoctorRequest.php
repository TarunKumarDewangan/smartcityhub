<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Hospital;
use App\Models\Doctor;

class UpdateDoctorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $doctor = $this->route('hospital_doctor') ?? $this->route('doctor');
        if (!$doctor) {
            return false;
        }

        if (is_numeric($doctor)) {
            $doctor = Doctor::find($doctor);
        }

        if (!$doctor) {
            return false;
        }

        $hospital = Hospital::where('user_id', $this->user()->id)->first();
        return ($hospital && $doctor->hospital_id === $hospital->id) || $this->user()->role === 'Admin';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'string',
            'specialty' => 'string',
            'type' => 'in:Staff,Consultant,Outside,Resident',
            'is_available' => 'boolean',
            'crowd_status' => 'nullable|in:Low,Medium,High',
            'visiting_days' => 'nullable|string',
            'visiting_hours' => 'nullable|string',
            'unavailable_date' => 'nullable|date_format:Y-m-d',
        ];
    }
}

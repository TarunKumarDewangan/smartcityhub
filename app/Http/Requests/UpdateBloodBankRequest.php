<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\BloodBank;

class UpdateBloodBankRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $bloodBankId = $this->route('id');
        if (!$bloodBankId) {
            return false;
        }
        $bloodBank = BloodBank::find($bloodBankId);
        if (!$bloodBank) {
            return false;
        }
        return $bloodBank->user_id === $this->user()->id || $this->user()->role === 'Admin';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'string',
            'address' => 'string',
            'contact' => 'string',
            'blood_groups_available' => 'nullable|string',
        ];
    }
}

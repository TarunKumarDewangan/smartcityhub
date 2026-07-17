<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\CityIssue;

class UpdateCityIssueRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $cityIssue = $this->route('city_issue');
        if (!$cityIssue) {
            return false;
        }

        if (is_numeric($cityIssue)) {
            $cityIssue = CityIssue::find($cityIssue);
        }

        if (!$cityIssue) {
            return false;
        }

        return $this->user()->role === 'Admin' || $cityIssue->user_id === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        if ($this->user()->role === 'Admin') {
            return [
                'status' => 'required|string|in:Open,In Progress,Resolved,Closed',
            ];
        }

        return [
            'type' => 'string',
            'description' => 'string',
            'status' => 'string|in:Open,Closed',
        ];
    }
}

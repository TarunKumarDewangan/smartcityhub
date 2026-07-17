<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'hospital_id' => $this->hospital_id,
            'name' => $this->name,
            'specialty' => $this->specialty,
            'type' => $this->type,
            'is_available' => (bool) $this->is_available,
            'crowd_status' => $this->crowd_status ?? 'Low',
            'visiting_days' => $this->visiting_days,
            'visiting_hours' => $this->visiting_hours,
            'unavailable_date' => $this->unavailable_date ? $this->unavailable_date->format('Y-m-d') : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
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
            'provider_id' => $this->provider_id,
            'name' => $this->name,
            'category' => $this->category,
            'area' => $this->area,
            'contact_phone' => $this->contact_phone,
            'rating' => $this->rating ? (float) $this->rating : null,
            'is_available' => (bool) $this->is_available,
            'is_approved' => (bool) $this->is_approved,
            'description' => $this->description,
            'working_days' => $this->working_days,
            'working_hours' => $this->working_hours,
            'provider' => new UserResource($this->whenLoaded('provider')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

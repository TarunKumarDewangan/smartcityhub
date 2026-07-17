<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopResource extends JsonResource
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
            'owner_id' => $this->owner_id,
            'name' => $this->name,
            'category' => $this->category,
            'description' => $this->description,
            'address' => $this->address,
            'contact_phone' => $this->contact_phone,
            'image_url' => $this->image_url,
            'opening_days' => $this->opening_days,
            'opening_hours' => $this->opening_hours,
            'is_approved' => (bool) $this->is_approved,
            'latitude' => $this->latitude ? (float) $this->latitude : null,
            'longitude' => $this->longitude ? (float) $this->longitude : null,
            'average_rating' => $this->average_rating ? (float) $this->average_rating : null,
            'rating_count' => $this->rating_count ? (int) $this->rating_count : 0,
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'owner' => new UserResource($this->whenLoaded('owner')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

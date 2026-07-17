<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'shop_id' => $this->shop_id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'description' => $this->description,
            'image_url' => $this->image_url,
            'image_url_2' => $this->image_url_2,
            'is_featured' => (bool) $this->is_featured,
            'average_rating' => $this->average_rating ? (float) $this->average_rating : null,
            'rating_count' => $this->rating_count ? (int) $this->rating_count : 0,
            'shop' => new ShopResource($this->whenLoaded('shop')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

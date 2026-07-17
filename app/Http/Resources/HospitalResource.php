<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HospitalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $this->user_id ? \App\Models\User::find($this->user_id) : null;

        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'address'             => $this->address,
            'contact'             => $this->contact ?? ($user ? $user->phone : null),
            'crowd_status'        => $this->crowd_status,
            'rating'              => $this->rating ? (float) $this->rating : null,
            'has_emergency'       => (bool) $this->has_emergency,
            'bed_count'           => $this->bed_count,
            'emergency_services'  => $this->emergency_services,
            'latitude'            => $this->latitude,
            'longitude'           => $this->longitude,
            'user_id'             => $this->user_id,
            'representative_name' => $user ? $user->name : null,
            'email'               => $user ? $user->email : null,
            'phone'               => $user ? $user->phone : null,
            'is_favorite'         => auth('sanctum')->user() 
                ? \DB::table('favorite_hospitals')
                    ->where('user_id', auth('sanctum')->user()->id)
                    ->where('hospital_id', $this->id)
                    ->exists()
                : false,
            'doctors'             => DoctorResource::collection($this->whenLoaded('doctors')),
            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,
        ];
    }
}

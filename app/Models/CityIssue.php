<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CityIssue extends Model
{
    protected $fillable = [
        'user_id', 'type', 'description', 'status',
        'reporter_name', 'reporter_phone',
        'latitude', 'longitude', 'location_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

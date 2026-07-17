<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $fillable = ['hospital_id', 'name', 'specialty', 'type', 'is_available', 'crowd_status', 'visiting_days', 'visiting_hours', 'unavailable_date'];

    protected $casts = [
        'is_available' => 'boolean',
        'unavailable_date' => 'date:Y-m-d',
    ];

    public function hospital()
    {
        return $this->belongsTo(Hospital::class);
    }
}

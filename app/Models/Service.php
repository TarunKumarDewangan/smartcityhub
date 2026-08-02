<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['provider_id', 'name', 'category', 'area', 'contact_phone', 'rating', 'is_available', 'description', 'working_days', 'working_hours', 'is_approved'];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function requests()
    {
        return $this->hasMany(ServiceRequest::class);
    }
}

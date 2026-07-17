<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hospital extends Model
{
    protected $fillable = ['name', 'address', 'crowd_status', 'rating', 'user_id', 'has_emergency', 'bed_count', 'emergency_services', 'latitude', 'longitude'];

    protected $casts = [
        'has_emergency' => 'boolean',
        'bed_count'     => 'integer',
        'latitude'      => 'float',
        'longitude'     => 'float',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($hospital) {
            if (is_null($hospital->rating) || $hospital->rating == 0.0) {
                $hospital->rating = 2.5;
            }
        });
    }

    public function doctors()
    {
        return $this->hasMany(Doctor::class);
    }

    public function getCrowdStatusAttribute()
    {
        // Calculate average crowd status based on doctors
        $doctors = $this->doctors;
        if (!$doctors || $doctors->isEmpty()) {
            return 'Low';
        }

        $sum = 0;
        $count = 0;
        foreach ($doctors as $doctor) {
            $status = $doctor->crowd_status;
            if ($status === 'Medium') {
                $sum += 2;
            } elseif ($status === 'High') {
                $sum += 3;
            } else {
                $sum += 1;
            }
            $count++;
        }

        $avg = $sum / $count;
        if ($avg <= 1.5) {
            return 'Low';
        } elseif ($avg <= 2.5) {
            return 'Medium';
        } else {
            return 'High';
        }
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorite_hospitals');
    }
}

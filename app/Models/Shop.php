<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $fillable = [
        'name',
        'category',
        'description',
        'address',
        'contact_phone',
        'image_url',
        'owner_id',
        'latitude',
        'longitude',
        'opening_days',
        'opening_hours',
    ];

    protected $appends = ['average_rating', 'rating_count'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function ratings()
    {
        return $this->morphMany(Rating::class, 'ratable');
    }

    public function getAverageRatingAttribute()
    {
        if (array_key_exists('ratings_avg_rating', $this->attributes)) {
            return $this->attributes['ratings_avg_rating'] !== null 
                ? round($this->attributes['ratings_avg_rating'], 1) 
                : 2.5;
        }
        $avg = $this->ratings()->avg('rating');
        return $avg ? round($avg, 1) : 2.5; // Default to 2.5 as requested
    }

    public function getRatingCountAttribute()
    {
        if (array_key_exists('ratings_count', $this->attributes)) {
            return (int) $this->attributes['ratings_count'];
        }
        return $this->ratings()->count();
    }
}

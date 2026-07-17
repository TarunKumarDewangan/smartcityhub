<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['shop_id', 'name', 'price', 'description', 'image_url', 'image_url_2', 'is_featured'];

    protected $appends = ['average_rating', 'rating_count'];

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    const MAX_FEATURED_PER_SHOP = 3;

    public function shop()
    {
        return $this->belongsTo(Shop::class);
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

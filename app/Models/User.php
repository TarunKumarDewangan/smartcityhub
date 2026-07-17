<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Make sure this is here!

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // Make sure HasApiTokens is included

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'is_approved',
        'phone_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_approved' => 'boolean',
    ];

    public function favoriteHospitals()
    {
        return $this->belongsToMany(Hospital::class, 'favorite_hospitals');
    }
}

<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\Hospital;
use Illuminate\Database\Seeder;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        $hospitals = Hospital::all();

        if ($hospitals->isEmpty()) {
            return;
        }

        $specialties = ['Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics', 'Dermatology', 'General Medicine'];
        $types = ['Staff', 'Consultant', 'Resident'];

        foreach ($hospitals as $hospital) {
            // Create 3 doctors for each hospital
            for ($i = 1; $i <= 3; $i++) {
                $visitingDays = ['Mon, Wed, Fri', 'Tue, Thu, Sat', 'Daily', 'Mon-Fri'][rand(0, 3)];
                $visitingHours = ['09:00 AM - 01:00 PM', '02:00 PM - 06:00 PM', '10:00 AM - 04:00 PM'][rand(0, 2)];
                Doctor::create([
                    'hospital_id' => $hospital->id,
                    'name' => 'Dr. ' . fake()->name(),
                    'specialty' => $specialties[array_rand($specialties)],
                    'type' => $types[array_rand($types)],
                    'is_available' => (bool)rand(0, 1),
                    'crowd_status' => ['Low', 'Medium', 'High'][rand(0, 2)],
                    'visiting_days' => $visitingDays,
                    'visiting_hours' => $visitingHours,
                ]);
            }
        }
    }
}

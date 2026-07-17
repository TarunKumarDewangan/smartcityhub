<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('city_issues', function (Blueprint $table) {
            $table->string('reporter_name')->nullable()->after('description');
            $table->string('reporter_phone')->nullable()->after('reporter_name');
            $table->decimal('latitude', 10, 7)->nullable()->after('reporter_phone');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('location_address')->nullable()->after('longitude');
        });
    }

    public function down(): void
    {
        Schema::table('city_issues', function (Blueprint $table) {
            $table->dropColumn(['reporter_name', 'reporter_phone', 'latitude', 'longitude', 'location_address']);
        });
    }
};

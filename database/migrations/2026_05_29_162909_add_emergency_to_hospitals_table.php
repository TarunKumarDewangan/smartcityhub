<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hospitals', function (Blueprint $table) {
            $table->boolean('has_emergency')->default(false)->after('address');
            $table->unsignedInteger('bed_count')->nullable()->after('has_emergency');
            $table->text('emergency_services')->nullable()->after('bed_count');
        });
    }

    public function down(): void
    {
        Schema::table('hospitals', function (Blueprint $table) {
            $table->dropColumn(['has_emergency', 'bed_count', 'emergency_services']);
        });
    }
};

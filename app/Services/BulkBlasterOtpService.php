<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class BulkBlasterOtpService
{
    private const CODE_TTL_MINUTES = 5;
    private const MAX_SENDS_PER_HOUR = 3;

    /**
     * Generate an OTP for the given phone, send it via BulkBlaster, and
     * cache it for later verification.
     *
     * @throws RuntimeException when the per-phone send cap is hit, or the
     *                          SMS provider fails to deliver.
     */
    public function sendOtp(string $phone): void
    {
        $sendCountKey = "otp_send_count:{$phone}";
        $sendCount = Cache::get($sendCountKey, 0);

        if ($sendCount >= self::MAX_SENDS_PER_HOUR) {
            throw new RuntimeException('Too many OTP requests for this number. Please try again later.');
        }

        $code = (string) random_int(100000, 999999);

        $apiKey = config('services.bulkblaster.api_key');
        $endpoint = config('services.bulkblaster.endpoint');

        if (!$apiKey) {
            throw new RuntimeException('OTP service is not configured on the server.');
        }

        try {
            $response = Http::timeout(10)->post($endpoint, [
                'apiKey' => $apiKey,
                'phone' => preg_replace('/^\+91/', '', $phone),
                'otp' => $code,
                'brandName' => 'Smart City',
                'senderType' => 'FYDBZR',
            ]);
        } catch (\Throwable $e) {
            Log::error('BulkBlaster OTP send failed: ' . $e->getMessage());
            throw new RuntimeException('Failed to send verification code. Please try again.');
        }

        if (!$response->successful() || !($response->json('success'))) {
            Log::error('BulkBlaster OTP send rejected: ' . $response->body());
            throw new RuntimeException('Failed to send verification code. Please try again.');
        }

        Cache::put("otp:{$phone}", $code, now()->addMinutes(self::CODE_TTL_MINUTES));
        Cache::put($sendCountKey, $sendCount + 1, now()->addHour());
    }

    /**
     * Verify a submitted OTP against the cached one. Single-use: the code
     * is invalidated as soon as it's checked, whether it matched or not.
     */
    public function verifyOtp(string $phone, string $code): bool
    {
        $cacheKey = "otp:{$phone}";
        $expected = Cache::get($cacheKey);

        if (!$expected) {
            return false;
        }

        Cache::forget($cacheKey);

        return hash_equals($expected, $code);
    }
}

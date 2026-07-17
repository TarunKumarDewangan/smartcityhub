<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use RuntimeException;
use Throwable;

class FirebaseAuthService
{
    /**
     * Verify a Firebase phone-auth ID token and confirm it belongs to the
     * given phone number.
     *
     * @throws RuntimeException when the token is invalid, expired, or the
     *                          phone number on the token doesn't match.
     */
    public function verifyPhoneNumber(string $idToken, string $expectedPhone): void
    {
        $credentials = config('services.firebase.credentials');

        if ($credentials && !str_starts_with($credentials, '/') && !preg_match('/^[A-Z]:\\\\/i', $credentials)) {
            $credentials = base_path($credentials);
        }

        if (!$credentials || !file_exists($credentials)) {
            throw new RuntimeException('Phone verification is not configured on the server.');
        }

        try {
            $auth = (new Factory())->withServiceAccount($credentials)->createAuth();
            $verifiedToken = $auth->verifyIdToken($idToken);
        } catch (Throwable $e) {
            throw new RuntimeException('Phone verification failed. Please verify your phone number again.');
        }

        $verifiedPhone = $verifiedToken->claims()->get('phone_number');

        if (!$verifiedPhone || $verifiedPhone !== $expectedPhone) {
            throw new RuntimeException('The verified phone number does not match the number you entered.');
        }
    }
}

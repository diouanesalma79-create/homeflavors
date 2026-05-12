<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role'     => 'required|in:customer,cook',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'nationality' => 'nullable|string|max:255',
            'bio'         => 'nullable|string',
        ]);

        $profilePicturePath = null;
        if ($request->hasFile('profile_picture')) {
            $profilePicturePath = $request->file('profile_picture')->store('profile_pictures', 'public');
        }

        Log::info('Registering user:', [
            'email' => $request->email,
            'role'  => $request->role,
        ]);

        try {
            $user = User::create([
                'name'            => $request->name,
                'email'           => $request->email,
                'password'        => Hash::make($request->password),
                'role'            => $request->role,
                'status'          => 'active',
                'profile_picture' => $profilePicturePath,
                'nationality'     => $request->nationality,
                'bio'             => $request->bio,
            ]);

            Log::info('User created successfully:', ['id' => $user->id]);
        } catch (\Exception $e) {
            Log::error('User creation failed:', [
                'error' => $e->getMessage(),
                'data'  => $request->except(['password', 'password_confirmation']),
            ]);
            return $this->error('Failed to create user account', 500);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('Token created for user:', ['user_id' => $user->id]);

        return $this->success([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => new UserResource($user),
        ], 'User registered successfully', 201);
    }

    /**
     * Login user and create token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Normalize email: trim whitespace and convert to lowercase
        $email = strtolower(trim($request->email));

        // Retrieve user by email
        $user = User::where('email', $email)->first();


        // Verify user exists and password is correct securely
        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->error('Invalid login details', 401);
        }

        // Create Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => new UserResource($user),
        ], 'Login successful');
    }
    /**
     * Logout user (Revoke the token).
     */
    public function logout(Request $request)
    {
        // Revoke all tokens for this user to ensure a complete system-wide logout
        $request->user()->tokens()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    /**
     * Get the authenticated User.
     */
    public function me(Request $request)
    {
        return $this->success(new UserResource($request->user()));
    }
}

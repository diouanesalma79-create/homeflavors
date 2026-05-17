<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\RecipeResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Traits\ApiResponse;

class ProfileController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of chefs/cooks.
     */
    public function chefs()
    {
        $chefs = User::where('role', 'cook')->where('status', 'active')->paginate(10);

        return $this->success(UserResource::collection($chefs)->response()->getData(true));
    }

    /**
     * Display the specified chef's public profile and recipes.
     */
    public function show(User $user)
    {
        if ($user->role !== 'cook' || $user->status !== 'active') {
            return $this->error('Chef not found', 404);
        }

        $user->load(['recipes' => function ($query) {
            $query->where('status', 'approved')->latest();
        }]);

        return $this->success([
            'profile' => new UserResource($user),
            'recipes' => RecipeResource::collection($user->recipes),
        ]);
    }

    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'bio' => 'nullable|string|max:1000',
            'nationality' => 'nullable|string|max:255',
        ]);

        $data = $request->only(['name', 'phone', 'address', 'bio', 'nationality']);

        if ($request->hasFile('profile_picture')) {
            // Delete old picture if exists
            if ($user->profile_picture && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->profile_picture)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_picture);
            }

            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $data['profile_picture'] = $path;
            $data['chef_image'] = null; // Clear system default when custom is uploaded
        }

        $user->update($data);

        return $this->success(new UserResource($user), 'Profile updated successfully');
    }
}

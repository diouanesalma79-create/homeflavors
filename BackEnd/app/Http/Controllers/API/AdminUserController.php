<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    use ApiResponse;

    public function pendingChefs(Request $request)
    {
        $request->validate([
            'page' => 'sometimes|integer|min:1',
        ]);

        $chefs = User::where('role', 'cook')->where('status', 'pending')->latest()->paginate(20);

        return $this->success(UserResource::collection($chefs)->response()->getData(true), 'Pending chefs retrieved successfully');
    }

    public function approveChef(Request $request, User $user)
    {
        $request->validate([
            '*' => 'prohibited',
        ]);

        if ($user->role !== 'cook') {
            return $this->error('Only chefs can be approved', 422);
        }

        $user->update(['status' => 'active']);

        return $this->success(new UserResource($user), 'Chef approved successfully');
    }

    public function rejectChef(Request $request, User $user)
    {
        $request->validate([
            '*' => 'prohibited',
        ]);

        if ($user->role !== 'cook') {
            return $this->error('Only chefs can be rejected', 422);
        }

        $user->update(['status' => 'inactive']);
        $user->tokens()->delete();

        return $this->success(new UserResource($user), 'Chef rejected successfully');
    }

    public function ban(Request $request, User $user)
    {
        $request->validate([
            '*' => 'prohibited',
        ]);

        $user->update(['status' => 'inactive']);
        $user->tokens()->delete();

        return $this->success(new UserResource($user), 'User banned successfully');
    }

    public function unban(Request $request, User $user)
    {
        $request->validate([
            '*' => 'prohibited',
        ]);

        $user->update(['status' => 'active']);

        return $this->success(new UserResource($user), 'User unbanned successfully');
    }
}

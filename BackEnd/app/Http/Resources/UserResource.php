<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'phone' => $this->phone,
            'address' => $this->address,
            'nationality' => $this->nationality,
            'bio' => $this->bio,
            'profile_picture' => $this->profile_picture,
            'profile_picture_url' => $this->getProfilePhotoUrl(),
            'profilePhoto' => $this->getProfilePhotoUrl(),
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Get the profile photo URL prioritizing local chef-named images.
     */
    protected function getProfilePhotoUrl(): ?string
    {
        // 1. Prioritize user-uploaded profile picture (active choice)
        if ($this->profile_picture) {
            if (filter_var($this->profile_picture, FILTER_VALIDATE_URL)) {
                return $this->profile_picture;
            }
            return asset('storage/' . $this->profile_picture);
        }

        // 2. Fallback to system-assigned chef image (celebrity seeding)
        if ($this->chef_image) {
            return asset('storage/chefs/' . $this->chef_image);
        }

        // 3. Final fallback: default avatar UI handled by frontend
        return null;
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Safeguard #14: null-safe participant, consistent field names.
     * Safeguard #10: graceful handling for deleted users.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Support both Eloquent objects and raw stdClass from DB::select
        $data = is_array($this->resource) ? (object) $this->resource : $this->resource;

        // Safeguard #10: null-safe participant
        $participantName = $data->name ?? 'Deleted User';
        $participantRole = $data->role ?? 'unknown';
        $profilePicture  = $data->profile_picture ?? null;

        return [
            'id'          => $data->id ?? null,
            'participant' => [
                'id'           => $data->id ?? null,
                'name'         => $participantName,
                'email'        => $data->email ?? '',
                'role'         => $participantRole,
                'profilePhoto' => $profilePicture
                    ? (filter_var($profilePicture, FILTER_VALIDATE_URL)
                        ? $profilePicture
                        : asset('storage/' . $profilePicture))
                    : null,
            ],
            'lastMessage' => $data->content ?? $data->lastMessage ?? '',
            'timestamp'   => isset($data->created_at)
                ? \Carbon\Carbon::parse($data->created_at)->toISOString()
                : null,
            'unread'      => isset($data->unread_count) ? $data->unread_count > 0 : false,
            'unreadCount' => $data->unread_count ?? 0,
        ];
    }
}

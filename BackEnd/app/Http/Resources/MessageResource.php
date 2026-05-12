<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'senderId'  => $this->sender_id,
            'content'   => $this->content,
            'timestamp' => $this->created_at->toISOString(),
            'isOwn'     => $this->sender_id === Auth::id(),
            'is_read'   => (bool) $this->is_read,
        ];
    }
}

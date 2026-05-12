<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'status'          => $this->status,
            'customerName'    => $this->user ? $this->user->name : 'Unknown User',
            'customerEmail'   => $this->user ? $this->user->email : '',
            'deliveryAddress' => $this->delivery_address,
            'items'           => [
                [
                    'id'       => $this->recipe_id,
                    'name'     => $this->recipe ? $this->recipe->title : 'Deleted Recipe',
                    'price'    => $this->recipe ? (float) $this->recipe->price : 0,
                    'quantity' => $this->quantity,
                ]
            ],
            'date'            => $this->created_at->toISOString(),
            'totalAmount'     => (float) $this->total_price,
            'notes'           => $this->notes,
        ];
    }
}

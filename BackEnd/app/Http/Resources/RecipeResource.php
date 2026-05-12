<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecipeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'description' => $this->description,
            'image'       => $this->image_url 
                ? (filter_var($this->image_url, FILTER_VALIDATE_URL) ? $this->image_url : asset('storage/' . $this->image_url)) 
                : asset('images/default-recipe.jpg'),
            'youtubeUrl'  => $this->youtube_url,
            'city'        => $this->city,
            'country'     => $this->country,
            'continent'   => $this->continent,
            'chefId'      => $this->user_id,
            'chefName'    => $this->user ? $this->user->name : null,
            'ingredients' => $this->ingredients ? explode(',', $this->ingredients) : [],
            'price'       => (float) $this->price,
            'category'    => $this->category,
            'status'      => $this->status,
        ];
    }
}

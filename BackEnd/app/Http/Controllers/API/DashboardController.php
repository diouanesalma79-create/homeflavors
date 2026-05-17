<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Order;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Traits\ApiResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Return aggregated chef dashboard statistics.
     * Single endpoint replaces 4 separate API calls.
     */
    public function stats()
    {
        $user   = Auth::user();
        $userId = $user->id;

        // ── Core Counts ──────────────────────────────────────────
        $totalRecipes = Recipe::where('user_id', $userId)->count();

        $pendingOrders = Order::whereHas('recipe', fn($q) => $q->where('user_id', $userId))
            ->where('status', 'pending')
            ->count();

        $unreadMessages = Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();

        $totalSaved = $user->savedRecipes()->count();

        // fallback rating — no rating column yet, use 4.8 placeholder
        $averageRating = (float) ($user->rating ?? 4.8);

        // ── Recent Recipes (last 4) ──────────────────────────────
        $recentRecipes = Recipe::where('user_id', $userId)
            ->latest()
            ->take(4)
            ->get()
            ->map(fn($r) => [
                'id'       => $r->id,
                'title'    => $r->title,
                'image'    => $r->image_url
                    ? (filter_var($r->image_url, FILTER_VALIDATE_URL)
                        ? $r->image_url
                        : asset('storage/' . $r->image_url))
                    : asset('images/default-recipe.jpg'),
                'status'   => $r->status,
                'category' => $r->category ?? 'General',
                'likes'    => $r->likes    ?? 0,
                'rating'   => $r->rating   ?? 0,
            ]);

        // ── Recent Messages (last 3 unique conversations) ────────
        $allMessages = Message::with(['sender', 'receiver'])
            ->where(fn($q) => $q
                ->where('sender_id',   $userId)
                ->orWhere('receiver_id', $userId)
            )
            ->latest()
            ->take(50)
            ->get();

        $seen = [];
        $recentMessages = [];

        foreach ($allMessages as $msg) {
            $partnerId = $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;
            if (isset($seen[$partnerId])) continue;
            $seen[$partnerId] = true;

            $partner = $msg->sender_id === $userId ? $msg->receiver : $msg->sender;
            if (!$partner) continue;

            $recentMessages[] = [
                'partnerId'    => $partner->id,
                'partnerName'  => $partner->name,
                'partnerRole'  => $partner->role,
                'partnerPhoto' => $partner->profile_picture
                    ? (filter_var($partner->profile_picture, FILTER_VALIDATE_URL)
                        ? $partner->profile_picture
                        : asset('storage/' . $partner->profile_picture))
                    : null,
                'lastMessage'  => $msg->content,
                'isUnread'     => $msg->receiver_id === $userId && !$msg->is_read,
                'timestamp'    => $msg->created_at->toISOString(),
            ];

            if (count($recentMessages) >= 3) break;
        }

        // ── Recent Activity Timeline ──────────────────────────────
        $activities = collect();

        // Orders received
        Order::whereHas('recipe', fn($q) => $q->where('user_id', $userId))
            ->with(['user', 'recipe'])
            ->latest()->take(4)->get()
            ->each(fn($o) => $activities->push([
                'type'      => 'order',
                'icon'      => '🛍️',
                'title'     => 'New order: "' . ($o->recipe->title ?? 'Recipe') . '"',
                'subtitle'  => 'From ' . ($o->user->name ?? 'Customer'),
                'timestamp' => $o->created_at->toISOString(),
                'color'     => 'olive',
            ]));

        // Recipe status changes
        Recipe::where('user_id', $userId)
            ->whereIn('status', ['approved', 'rejected'])
            ->latest('updated_at')->take(4)->get()
            ->each(fn($r) => $activities->push([
                'type'      => 'recipe',
                'icon'      => $r->status === 'approved' ? '✅' : '❌',
                'title'     => '"' . $r->title . '" was ' . $r->status,
                'subtitle'  => 'By admin',
                'timestamp' => $r->updated_at->toISOString(),
                'color'     => $r->status === 'approved' ? 'green' : 'red',
            ]));

        // Messages received
        Message::where('receiver_id', $userId)
            ->with('sender')->latest()->take(4)->get()
            ->each(function ($m) use (&$activities) {
                if (!$m->sender) return;
                $preview = strlen($m->content) > 45
                    ? substr($m->content, 0, 45) . '…'
                    : $m->content;
                $activities->push([
                    'type'      => 'message',
                    'icon'      => '💬',
                    'title'     => 'Message from ' . $m->sender->name,
                    'subtitle'  => $preview,
                    'timestamp' => $m->created_at->toISOString(),
                    'color'     => 'brown',
                ]);
            });

        $recentActivity = $activities
            ->sortByDesc('timestamp')
            ->take(8)
            ->values();

        return $this->success([
            'totalRecipes'   => $totalRecipes,
            'pendingOrders'  => $pendingOrders,
            'unreadMessages' => $unreadMessages,
            'totalSaved'     => $totalSaved,
            'averageRating'  => $averageRating,
            'recentRecipes'  => $recentRecipes,
            'recentMessages' => $recentMessages,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Return aggregated admin dashboard statistics.
     */
    public function adminStats()
    {
        return $this->success([
            'users' => [
                'total' => User::count(),
                'active' => User::where('status', 'active')->count(),
                'pending' => User::where('status', 'pending')->count(),
            ],
            'chefs' => [
                'total' => User::whereIn('role', ['cook', 'chef'])->count(),
                'active' => User::whereIn('role', ['cook', 'chef'])->where('status', 'active')->count(),
                'pending' => User::whereIn('role', ['cook', 'chef'])->where('status', 'pending')->count(),
            ],
            'orders' => [
                'total' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'accepted' => Order::where('status', 'accepted')->count(),
                'preparing' => Order::where('status', 'preparing')->count(),
                'delivered' => Order::where('status', 'delivered')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
            ],
            'recipes' => [
                'total' => Recipe::count(),
                'pending' => Recipe::where('status', 'pending')->count(),
                'approved' => Recipe::where('status', 'approved')->count(),
                'rejected' => Recipe::where('status', 'rejected')->count(),
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use App\Traits\ApiResponse;

class MessageController extends Controller
{
    use ApiResponse;

    /**
     * Search for users to start a conversation with.
     * Safeguards: #6 (min 2 chars, limit 10), #8 (auth scoped), #15 (validated)
     */
    public function searchUsers(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $query = trim($request->input('q'));
        $userId = Auth::id();

        $users = User::where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('email', 'LIKE', "%{$query}%");
            })
            ->whereIn('role', ['cook', 'customer'])  // both chefs and visitors
            ->where('id', '!=', $userId)             // exclude self (#8)
            ->where('status', 'active')
            ->select('id', 'name', 'email', 'role', 'profile_picture')
            ->limit(10)
            ->get();

        return $this->success($users->map(function ($user) {
            return [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'profilePhoto' => $user->profile_picture
                    ? (filter_var($user->profile_picture, FILTER_VALIDATE_URL)
                        ? $user->profile_picture
                        : asset('storage/' . $user->profile_picture))
                    : null,
            ];
        }));
    }

    /**
     * List all unique conversations for the authenticated user.
     * Safeguard #8: only fetches conversations involving the current user.
     * Safeguard #10: graceful handling if the other user is deleted (null-check in resource).
     */
    public function index()
    {
        $userId = Auth::id();

        // Get the last message with each unique contact
        // Using a clean Eloquent-based subquery instead of raw fragile SQL
        $latestMessageIds = Message::select(DB::raw('MAX(id) as id'))
            ->where(function ($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->orWhere('receiver_id', $userId);
            })
            ->groupBy(DB::raw(
                "CASE WHEN sender_id = {$userId} THEN receiver_id ELSE sender_id END"
            ))
            ->pluck('id');

        $messages = Message::with(['sender', 'receiver'])
            ->whereIn('id', $latestMessageIds)
            ->orderBy('created_at', 'desc')
            ->get();

        // Build conversation list with null-safe partner resolution (#10)
        $conversations = $messages->map(function ($message) use ($userId) {
            $partner = $message->sender_id === $userId
                ? $message->receiver
                : $message->sender;

            // Gracefully handle deleted users (#10)
            if (!$partner) {
                return null;
            }

            $unreadCount = Message::where('sender_id', $partner->id)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            return [
                'id'          => $partner->id,
                'participant' => [
                    'id'           => $partner->id,
                    'name'         => $partner->name,
                    'email'        => $partner->email,
                    'role'         => $partner->role,
                    'profilePhoto' => $partner->profile_picture
                        ? (filter_var($partner->profile_picture, FILTER_VALIDATE_URL)
                            ? $partner->profile_picture
                            : asset('storage/' . $partner->profile_picture))
                        : null,
                ],
                'lastMessage' => $message->content,
                'timestamp'   => $message->created_at->toISOString(),
                'unread'      => $unreadCount > 0,
                'unreadCount' => $unreadCount,
            ];
        })->filter()->values(); // Remove nulls from deleted users

        return $this->success($conversations);
    }

    /**
     * Get the chat history between the authenticated user and the given user.
     * Safeguards: #2 (ordered ASC), #3 (mark as read), #5 (limit 50), #8 (auth scoped)
     */
    public function show(User $user)
    {
        $userId = Auth::id();

        // Safeguard #5: get last 50 messages, ordered ASC (#2)
        $messages = Message::where(function ($q) use ($userId, $user) {
                $q->where('sender_id', $userId)->where('receiver_id', $user->id);
            })
            ->orWhere(function ($q) use ($userId, $user) {
                $q->where('sender_id', $user->id)->where('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc')   // #2: always ASC
            ->latest()
            ->take(50)
            ->get()
            ->sortBy('created_at')           // ensure ASC after take()
            ->values();

        // Safeguard #3: Mark incoming messages as read
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return $this->success(MessageResource::collection($messages));
    }

    /**
     * Send a new message.
     * Safeguards: #4 (no self-message), #15 (trim, max length, non-empty)
     */
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|integer|exists:users,id',
            'content'     => 'required|string|max:2000',
        ]);

        $senderId   = Auth::id();
        $receiverId = (int) $request->receiver_id;
        $content    = trim($request->content); // #15: trim whitespace

        // Safeguard #4: prevent self-messaging
        if ($senderId === $receiverId) {
            return $this->error('You cannot send a message to yourself.', 422);
        }

        // Safeguard #15: reject blank/whitespace-only messages
        if ($content === '') {
            return $this->error('Message content cannot be empty.', 422);
        }

        $message = Message::create([
            'sender_id'   => $senderId,
            'receiver_id' => $receiverId,
            'content'     => $content,
            'is_read'     => false,
        ]);

        $message->load('sender', 'receiver');

        return $this->success(new MessageResource($message), 'Message sent', 201);
    }
}

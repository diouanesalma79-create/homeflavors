<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\OrderResource;

use App\Traits\ApiResponse;

class OrderController extends Controller
{
    use ApiResponse;

    /**
     * List user's purchases (as a customer).
     */
    public function index()
    {
        $orders = Auth::user()->orders()->with(['recipe', 'recipe.user'])->latest()->paginate(10);
        return $this->success(OrderResource::collection($orders)->response()->getData(true));
    }

    /**
     * List incoming orders for a cook.
     */
    public function cookOrders()
    {
        $orders = Order::whereHas('recipe', function ($query) {
            $query->where('user_id', Auth::id());
        })->with(['user', 'recipe'])->latest()->paginate(10);

        return $this->success(OrderResource::collection($orders)->response()->getData(true));
    }

    /**
     * List all orders for admin.
     */
    public function adminOrders()
    {
        $orders = Order::with(['user', 'recipe'])->latest()->paginate(20);

        return $this->success(OrderResource::collection($orders)->response()->getData(true));
    }

    /**
     * Place a new order.
     */
    public function store(Request $request)
    {
        $request->validate([
            'recipe_id'        => 'required|exists:recipes,id',
            'quantity'         => 'required|integer|min:1',
            'delivery_address' => 'required|string',
            'notes'            => 'nullable|string',
        ]);

        $recipe = Recipe::findOrFail($request->recipe_id);
        
        $order = Order::create([
            'user_id'          => Auth::id(),
            'recipe_id'        => $recipe->id,
            'quantity'         => $request->quantity,
            'total_price'      => $recipe->price * $request->quantity,
            'status'           => 'pending',
            'delivery_address' => $request->delivery_address,
            'notes'            => $request->notes,
        ]);

        return $this->success(new OrderResource($order->load(['user', 'recipe'])), 'Order placed successfully', 201);
    }

    /**
     * Update order status (Cook only).
     */
    public function updateStatus(Request $request, Order $order)
    {
        // Authorization: Only the cook who owns the recipe can update the order
        if ($order->recipe->user_id !== Auth::id()) {
            return $this->error('Unauthorized', 403);
        }

        // Validation: Ensure the status is part of the approved flow
        $validated = $request->validate([
            'status' => 'required|in:pending,accepted,preparing,delivered,cancelled',
        ]);

        $allowedTransitions = [
            'pending' => ['accepted', 'cancelled'],
            'accepted' => ['preparing', 'cancelled'],
            'preparing' => ['delivered', 'cancelled'],
            'delivered' => [],
            'cancelled' => [],
        ];

        $status = $validated['status'];

        if (! in_array($status, $allowedTransitions[$order->status] ?? [], true)) {
            return $this->error('Invalid order status transition', 422);
        }

        $order->update(['status' => $status]);

        return $this->success(new OrderResource($order->load(['user', 'recipe'])), 'Order status updated');
    }

    /**
     * Update order status for admin.
     */
    public function adminUpdateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,accepted,preparing,delivered,cancelled',
        ]);

        $allowedTransitions = [
            'pending' => ['accepted', 'cancelled'],
            'accepted' => ['preparing', 'cancelled'],
            'preparing' => ['delivered', 'cancelled'],
            'delivered' => [],
            'cancelled' => [],
        ];

        $status = $validated['status'];

        if (! in_array($status, $allowedTransitions[$order->status] ?? [], true)) {
            return $this->error('Invalid order status transition', 422);
        }

        $order->update(['status' => $status]);

        return $this->success(new OrderResource($order->load(['user', 'recipe'])), 'Order status updated');
    }
}

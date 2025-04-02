import express from "express";
import { createOrder, getOrderById, updateOrder, deleteOrder } from "../controllers/order.controller.js";

const router = express.Router();

// Create a new order
router.post("/create", createOrder);

/*{
  "beeId": "12345",
  "img": "http://example.com/profile.jpg",
  "title": "sketch Product",
  "price": 150.00,
  "sellerId": "seller123",
  "buyerId": "buyer456",
  "isCompleted": true,
  "payment_intent": "pi_123456789"
}
*/

// Get order by ID
router.get("/:id", getOrderById);
//http://localhost:8800/api/orders/6784f436939cf90b16daff5b


// Update order (e.g., mark as completed)
router.put("/:id", updateOrder);
//http://localhost:8800/api/orders/6784f436939cf90b16daff5b


// Delete order by ID
router.delete("/:id", deleteOrder);
//http://localhost:8800/api/orders/6784f436939cf90b16daff5b

export default router;

import Order from "../models/order.model.js";

// Create Order
export const createOrder = async (req, res) => {
  try {
    const { beeId, img, title, price, sellerId, buyerId, payment_intent } = req.body;

    // Create a new order
    const newOrder = new Order({
      beeId,
      img,
      title,
      price,
      sellerId,
      buyerId,
      payment_intent,
    });

    // Save the order to the database
    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};


//update order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    //console.log("Updating order with ID:", id); 
    //console.log("Data to update:", updateData); 

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData }, 
      { new: true } 
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};


// Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};


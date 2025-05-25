import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { response } from "express";

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Placing User Order From Frontend
const placeOrder = async (req, res) => {
    const frontend_url = "http://localhost:5174";
    try {
        console.log('Received order request:', {
            userId: req.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });

        if (!req.userId) {
            return res.status(401).json({ 
                success: false, 
                message: "User ID not found in request" 
            });
        }

        // Convert amount to INR (assuming input is in USD)
        const amountInINR = Math.round(req.body.amount * 80); // Convert USD to INR (1 USD = 80 INR)

        const newOrder = new orderModel({
            userId: req.userId,
            items: req.body.items,
            amount: amountInINR, // Store amount in INR
            address: req.body.address,
            status: "Pending Payment"
        });

        await newOrder.save();
        console.log('Order saved to database:', newOrder._id);

        await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
        console.log('User cart cleared');

        // Razorpay Order creation in INR (amount in paise)
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: amountInINR * 100, // Convert INR to paise (1 INR = 100 paise)
            currency: "INR",
            receipt: `${newOrder._id}`,
        });

        console.log('Razorpay order created:', razorpayOrder.id);

        res.json({
            success: true,
            orderId: newOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        });
    } catch (error) {
        console.error('Order placement error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Order failed",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Verify Razorpay Payment
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        // Verify the payment signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Update order status
            await orderModel.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { 
                    payment: true, 
                    status: "Order Placed",
                    paymentId: razorpay_payment_id
                }
            );
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.json({ success: false, message: "Payment verification failed" });
    }
};

// Verify Order Status
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === true) {
            const updatedOrder = await orderModel.findByIdAndUpdate(
                orderId,
                { 
                    payment: true,
                    status: "Order Placed"
                },
                { new: true }
            );
            
            if (updatedOrder) {
                res.json({ success: true, message: "Order verified successfully" });
            } else {
                res.json({ success: false, message: "Order not found" });
            }
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Order cancelled" });
        }
    } catch (error) {
        console.error('Order verification error:', error);
        res.json({ success: false, message: "Error verifying order" });
    }
};


// user orders for frontend
const userOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({userId:req.userId})
        res.json({success:true,data:orders})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// Listing orders for admin panel:
const listOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


//  api for updating  order status
 const updateStatus = async (req,res) => {
   try {
    await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
    res.json({success:true,message:"Status Updated"})
   } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
   }
}

export { placeOrder, verifyPayment, verifyOrder ,userOrders,listOrders,updateStatus};


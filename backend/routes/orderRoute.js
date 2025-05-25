import express from "express"
import authMiddleware from "../middleware/auth.js"
import {placeOrder, verifyPayment, verifyOrder,userOrders, listOrders, updateStatus} from"../controllers/orderControllers.js"

const orderRouter = express.Router();

orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify", verifyPayment);
orderRouter.post("/verify-order", verifyOrder);

orderRouter.post("/userorders",authMiddleware,userOrders)

orderRouter.get("/list",listOrders);

orderRouter.post("/status",updateStatus)

export default orderRouter;
import express from "express";
import { createOrder,verifyPayment,getPaymentDetails,getAllPayments } from "../Controllers/Payment.js";
import {verifytoken} from "../Middleware/user.js";

const routes=express.Router();

routes.post("/create-order", verifytoken,createOrder);
routes.post("/verify-payment",verifytoken, verifyPayment);
routes.get("/get-payment-details", verifytoken,getPaymentDetails);
routes.get("/getAllPayments",verifytoken,getAllPayments)

export default routes;
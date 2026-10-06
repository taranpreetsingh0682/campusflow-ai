import { Router } from "express";

import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../controllers/Payment.controller";

const router = Router();

// CREATE PAYMENT
router.post("/", createPayment);

// GET ALL PAYMENTS
router.get("/", getAllPayments);

// GET PAYMENT BY ID
router.get("/:id", getPaymentById);

// UPDATE PAYMENT
router.put("/:id", updatePayment);

// DELETE PAYMENT
router.delete("/:id", deletePayment);

export default router;
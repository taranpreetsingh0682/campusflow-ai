import { Request, Response } from "express";
import Payment from "../models/Payment";
import StudentFee from "../models/StudentFee";

// CREATE PAYMENT
export const createPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      student,
      studentFee,
      amount,
      paymentMethod,
      transactionId,
      paymentDate,
      status = "success",
    } = req.body;

    // Required fields
    if (!student || !studentFee || amount === undefined || !paymentMethod) {
      res.status(400).json({
        success: false,
        message:
          "Student, student fee, amount and payment method are required",
      });
      return;
    }

    // Validate amount
    if (amount <= 0) {
      res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0",
      });
      return;
    }

    // Find StudentFee
    const existingStudentFee = await StudentFee.findById(studentFee);

    if (!existingStudentFee) {
      res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
      return;
    }

    // Make sure payment belongs to same student
    if (existingStudentFee.student.toString() !== student) {
      res.status(400).json({
        success: false,
        message: "Payment student does not match student fee",
      });
      return;
    }

    // Payment cannot be greater than pending amount
    if (amount > existingStudentFee.pendingAmount) {
      res.status(400).json({
        success: false,
        message: "Payment amount cannot be greater than pending amount",
      });
      return;
    }

    // Create payment
    const payment = await Payment.create({
      student,
      studentFee,
      amount,
      paymentMethod,
      transactionId,
      paymentDate,
      status,
    });

    // Update StudentFee only when payment is successful
    if (status === "success") {
      const newPaidAmount = existingStudentFee.paidAmount + amount;

      const newPendingAmount =
        existingStudentFee.payableAmount - newPaidAmount;

      let newStatus: "pending" | "partial" | "paid" = "pending";

      if (newPendingAmount === 0) {
        newStatus = "paid";
      } else if (newPaidAmount > 0) {
        newStatus = "partial";
      }

      const newNoDues = newPendingAmount === 0;

      existingStudentFee.paidAmount = newPaidAmount;
      existingStudentFee.pendingAmount = newPendingAmount;
      existingStudentFee.status = newStatus;
      existingStudentFee.noDues = newNoDues;

      await existingStudentFee.save();
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate("student")
      .populate("studentFee");

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: populatedPayment,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Transaction ID already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

// GET ALL PAYMENTS
export const getAllPayments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const payments = await Payment.find()
      .populate("student")
      .populate("studentFee")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

// GET PAYMENT BY ID
export const getPaymentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("student")
      .populate("studentFee");

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

// UPDATE PAYMENT
export const updatePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found",
      });
      return;
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("student")
      .populate("studentFee");

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: updatedPayment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
};

// DELETE PAYMENT
export const deletePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: error.message,
    });
  }
};
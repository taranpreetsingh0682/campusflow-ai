import { Router } from "express";

import {
  createFeeStructure,
  getAllFeeStructures,
  getFeeStructureById,
  getFeeStructureByDetails,
  updateFeeStructure,
  deleteFeeStructure,
} from "../controllers/FeeStructure.controller";

const router = Router();

// Create fee structure
router.post("/", createFeeStructure);

// Get all fee structures
router.get("/", getAllFeeStructures);

// Get fee structure by department, semester and academic year
router.get("/details", getFeeStructureByDetails);

// Get fee structure by ID
router.get("/:id", getFeeStructureById);

// Update fee structure
router.put("/:id", updateFeeStructure);

// Delete fee structure
router.delete("/:id", deleteFeeStructure);

export default router;
import { Request, Response } from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification";
import Student from "../models/Student";
import Department from "../models/Department";
import User from "../models/User";

// Create a notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, type = "general", audience = "all", department, role, student, expiresAt } = req.body;
    const createdBy = (req as any).user?.id || (req as any).user?._id || req.body.createdBy;

    if (!title?.trim() || !message?.trim() || !createdBy) {
      return res.status(400).json({ success: false, message: "Title, message and createdBy are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({ success: false, message: "Invalid createdBy user ID" });
    }
    if (!await User.findById(createdBy)) {
      return res.status(404).json({ success: false, message: "Creator user not found" });
    }

    const validTypes = ["announcement", "roll_number", "event", "fee", "attendance", "general"];
    const validAudiences = ["all", "department", "role", "student"];
    if (!validTypes.includes(type) || !validAudiences.includes(audience)) {
      return res.status(400).json({ success: false, message: "Invalid notification type or audience" });
    }

    const notificationData: Record<string, any> = { title: title.trim(), message: message.trim(), type, audience, createdBy };

    if (audience === "department") {
      if (!department || !mongoose.Types.ObjectId.isValid(department)) {
        return res.status(400).json({ success: false, message: "Valid department ID is required" });
      }
      if (!await Department.findById(department)) {
        return res.status(404).json({ success: false, message: "Department not found" });
      }
      notificationData.department = department;
    }
    if (audience === "role") {
      if (!["student", "faculty", "hod", "accounts", "admin"].includes(role)) {
        return res.status(400).json({ success: false, message: "Valid role is required" });
      }
      notificationData.role = role;
    }
    if (audience === "student") {
      if (!student || !mongoose.Types.ObjectId.isValid(student)) {
        return res.status(400).json({ success: false, message: "Valid student ID is required" });
      }
      if (!await Student.findById(student)) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
      notificationData.student = student;
    }
    if (expiresAt !== undefined) {
      const expiry = new Date(expiresAt);
      if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
        return res.status(400).json({ success: false, message: "expiresAt must be a valid future date" });
      }
      notificationData.expiresAt = expiry;
    }

    const notification = await Notification.create(notificationData);
    const populated = await Notification.findById(notification._id)
      .populate("createdBy", "name email role")
      .populate("department")
      .populate("student");

    return res.status(201).json({ success: true, message: "Notification created successfully", data: populated });
  } catch (error: any) {
    console.error("Create Notification Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create notification", error: error.message });
  }
};

// Get notifications visible to a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (typeof userId !== "string" || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId).select("_id role");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const student = await Student.findOne({ user: userId }).select("_id department");
    const filters: any[] = [{ audience: "all" }, { audience: "role", role: user.role }];
    if (student) {
      filters.push({ audience: "student", student: student._id });
      filters.push({ audience: "department", department: student.department });
    }

    const notifications = await Notification.find({
      $or: filters,
      $and: [{ $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }] }],
    })
      .populate("createdBy", "name email role")
      .populate("department")
      .sort({ createdAt: -1 });

    const data = notifications.map((item) => {
      const obj = item.toObject();
      return { ...obj, isRead: item.readBy.some((id) => id.toString() === userId) };
    });

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error: any) {
    console.error("Get User Notifications Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications", error: error.message });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (typeof id !== "string" || typeof userId !== "string" ||
      !mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Valid notification ID and userId are required" });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: userId } },
      { new: true, runValidators: true }
    );

    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    return res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error: any) {
    console.error("Mark Notification Read Error:", error);
    return res.status(500).json({ success: false, message: "Failed to mark notification as read", error: error.message });
  }
};
import Record from "../models/records.model.js";
import { Response } from "express";
import { Request } from "../types/auth.types.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { createRecordSchema } from "../validators/records.validator.js";

class RecordsController {
  async getRecords(req: Request, res: Response) {
    const {
      type,
      category,
      from,
      to,
      page = "1",
      limit = "20",
      sort = "date",
      order = "desc",
    } = req.query;

    const filter: Record<string, unknown> = {
      is_deleted: false,
    };

    if (typeof type === "string") {
      filter.type = type;
    }

    if (typeof category === "string") {
      filter.category = category;
    }

    if (typeof from === "string" || typeof to === "string") {
      filter.date = {};

      if (typeof from === "string") {
        (filter.date as Record<string, Date>).$gte = new Date(from);
      }

      if (typeof to === "string") {
        (filter.date as Record<string, Date>).$lte = new Date(to);
      }
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 20, 1);
    const sortField = typeof sort === "string" ? sort : "date";
    const sortDirection = order === "asc" ? 1 : -1;

    const allowedSortFields = [
      "amount",
      "type",
      "category",
      "date",
      "createdAt",
      "updatedAt",
    ];
    const finalSortField = allowedSortFields.includes(sortField)
      ? sortField
      : "date";

    const records = await Record.find(filter)
      .sort({ [finalSortField]: sortDirection })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res
      .status(200)
      .json(new ApiResponse(200, records, "Records retrieved successfully"));
    return;
  }

  async getRecordById(req: Request, res: Response) {
    const record = await Record.findOne({
      _id: req.params.id,
      created_by: req.user?._id,
    });
    if (!record) {
      res.status(404).json(new ApiResponse(404, null, "Record not found"));
      return;
    }
    res
      .status(200)
      .json(new ApiResponse(200, record, "Record retrieved successfully"));
    return;
  }

  async createRecord(req: Request, res: Response) {
    const payload = req.body;
    const parsedPayload = createRecordSchema.safeParse(payload);
    if (!parsedPayload.success) {
      res
        .status(400)
        .json(new ApiResponse(400, null, parsedPayload.error.message));
      return;
    }
    const { amount, type, category, date, notes } = parsedPayload.data;
    const record = await Record.create({
      amount,
      type,
      category,
      date,
      notes,
      created_by: req.user?._id,
    });
    res
      .status(201)
      .json(new ApiResponse(201, record, "Record created successfully"));
    return;
  }

  async updateRecord(req: Request, res: Response) {
    const payload = req.body;
    const parsedPayload = createRecordSchema.partial().safeParse(payload);
    if (!parsedPayload.success) {
      res
        .status(400)
        .json(new ApiResponse(400, null, parsedPayload.error.message));
      return;
    }
    const record = await Record.findById(req.params.id);
    if (!record || record.created_by.toString() !== req.user?._id.toString()) {
      res.status(404).json(new ApiResponse(404, null, "Record not found"));
      return;
    }
    const { amount, type, category, date, notes } = parsedPayload.data;
    if (amount !== undefined) record.amount = amount;
    if (type !== undefined) record.type = type;
    if (category !== undefined) record.category = category;
    if (date !== undefined) record.date = date;
    if (notes !== undefined) record.notes = notes;
    await record.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, record, "Record updated successfully"));
    return;
  }

  async deleteRecord(req: Request, res: Response) {
    const record = await Record.findById(req.params.id);
    if (!record || record.created_by.toString() !== req.user?._id.toString()) {
      res.status(404).json(new ApiResponse(404, null, "Record not found"));
      return;
    }
    record.is_deleted = true;
    await record.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, null, "Record deleted successfully"));
    return;
  }
  async restoreRecord(req: Request, res: Response) {
    const record = await Record.findById(req.params.id);
    if (!record || record.created_by.toString() !== req.user?._id.toString()) {
      res.status(404).json(new ApiResponse(404, null, "Record not found"));
      return;
    }
    record.is_deleted = false;
    await record.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, null, "Record restored successfully"));
    return;
  }
}

export default new RecordsController();

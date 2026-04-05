import { Response } from "express";
import { Request } from "../types/auth.types.js";
import Record from "../models/records.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
class DashboardController {
  async getDashboardSummary(req: Request, res: Response) {
    //get total income, expenses, and net balance
    const records = await Record.find({
      created_by: req.user?._id,
      is_deleted: false,
    });

    const summary = {
      totalIncome: records
        .filter((r) => r.type === "income")
        .reduce((sum, r) => sum + r.amount, 0),
      totalExpenses: records
        .filter((r) => r.type === "expense")
        .reduce((sum, r) => sum + r.amount, 0),
      netBalance: records.reduce(
        (sum, r) => sum + (r.type === "income" ? r.amount : -r.amount),
        0
      ),
    };
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          summary,
          "Dashboard summary retrieved successfully"
        )
      );
  }

  async getDashboardTotalsByCategory(req: Request, res: Response) {
    const records = await Record.find({
      created_by: req.user?._id,
      is_deleted: false,
    });
    const totalsByCategory: Record<
      string,
      { income: number; expense: number }
    > = {};
    records.forEach((r) => {
      if (!totalsByCategory[r.category]) {
        totalsByCategory[r.category] = { income: 0, expense: 0 };
      }
      totalsByCategory[r.category][
        r.type === "income" ? "income" : "expense"
      ] += r.amount;
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          totalsByCategory,
          "Dashboard totals by category retrieved successfully"
        )
      );
    return;
  }

  async getDashboardTrends(req: Request, res: Response) {
    const records = await Record.find({
      created_by: req.user?._id,
      is_deleted: false,
    }).sort({ date: 1 });
    const months = req.query.months ? Number(req.query.months) : 6;
    const trends: Record<string, { income: number; expense: number }> = {};
    const now = new Date();
    records.forEach((r) => {
      const monthKey = `${r.date.getFullYear()}-${(r.date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      if (!trends[monthKey]) {
        trends[monthKey] = { income: 0, expense: 0 };
      }
      trends[monthKey][r.type === "income" ? "income" : "expense"] += r.amount;
    });

    const sortedKeys = Object.keys(trends).sort();
    const recentTrends: Record<string, { income: number; expense: number }> =
      {};
    sortedKeys.forEach((key) => {
      const [year, month] = key.split("-").map(Number);
      const date = new Date(year, month - 1);
      if (date >= new Date(now.getFullYear(), now.getMonth() - months, 1)) {
        recentTrends[key] = trends[key];
      }
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          recentTrends,
          "Dashboard trends retrieved successfully"
        )
      );
    return;
  }

  async getTopCategories(req: Request, res: Response) {
    const records = await Record.find({
      created_by: req.user?._id,
      is_deleted: false,
    });
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const categoryTotals: Record<string, number> = {};
    records.forEach((r) => {
      if (!categoryTotals[r.category]) {
        categoryTotals[r.category] = 0;
      }
      categoryTotals[r.category] += r.amount;
    });
    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .reduce(
        (obj, [key, value]) => {
          obj[key] = value;
          return obj;
        },
        {} as Record<string, number>
      );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          sortedCategories,
          "Top categories retrieved successfully"
        )
      );
    return;
  }

  async getRecentRecords(req: Request, res: Response) {
    const records = await Record.find({
      created_by: req.user?._id,
      is_deleted: false,
    })
      .sort({ date: -1 })
      .limit(10);
    res
      .status(200)
      .json(
        new ApiResponse(200, records, "Recent records retrieved successfully")
      );
    return;
  }
}
export default new DashboardController();

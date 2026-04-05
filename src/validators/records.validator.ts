import z from "zod";

export const createRecordSchema = z.object({
  amount: z
    .number("amount is required")
    .positive("amount must be greater than 0"),
  type: z.enum(
    ["income", "expense"],
    "type must be either 'income' or 'expense'"
  ),
  category: z.string("category is required"),
  date: z.coerce.date("date is required"),
  notes: z.string().optional(),
});

import mongoose from "mongoose";
const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["income", "expense"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    notes: {
      type: String,
      trim: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Record = mongoose.model("Record", recordSchema);
export default Record;

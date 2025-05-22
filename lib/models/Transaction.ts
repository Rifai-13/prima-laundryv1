// models/Transaction.ts
import connectDB from "@/lib/mongodb";
import mongoose, { Document, Model, Schema } from "mongoose";

interface ITransaction extends Document {
  customerName: string;
  itemType: string;
  phoneNumber: string;
  weight: number;
  price: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    customerName: {
      type: String,
      required: [true, "Nama pelanggan harus diisi"],
    },
    itemType: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: (v: string) => /^\d{10,14}$/.test(v),
        message: "Nomor telepon harus 10-14 digit angka",
      },
    },
    weight: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


transactionSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

// let Transaction: Model<ITransaction>;

transactionSchema.statics = {
  async connect() {
    if (!mongoose.connection.readyState) {
      await connectDB();
    }
    return this;
  },
};

export const getTransactionModel = async (): Promise<Model<ITransaction>> => {
  if (mongoose.models.Transaction) {
    return mongoose.models.Transaction;
  }

  await connectDB();
  return mongoose.model<ITransaction>("Transaction", transactionSchema);
};

export type { ITransaction };

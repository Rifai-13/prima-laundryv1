//lib/models/Transaction.ts

import mongoose, { Model, Schema, Document } from 'mongoose';

export interface ITransaction {
  customerName: string;
  gender?: 'male' | 'female';
  serviceType?: 'reguler' | 'express' | 'super-express';
  additionalServices?: string[];
  itemType: string;
  phoneNumber: string;
  weight: number;
  price: number;
  status: 'pending' | 'processing' | 'completed';
}

export interface TransactionDocument extends ITransaction, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const transactionSchema = new Schema<TransactionDocument>(
  {
    customerName: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'] },
    serviceType: { type: String, enum: ['reguler', 'express', 'super-express'], default: 'reguler' },
    additionalServices: { type: [String], default: [] },
    itemType: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    weight: { type: Number, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export const getTransactionModel = (): Model<TransactionDocument> => {
  if (mongoose.models.Transaction) {
    return mongoose.models.Transaction as Model<TransactionDocument>;
  }
  return mongoose.model<TransactionDocument>('Transaction', transactionSchema);
};
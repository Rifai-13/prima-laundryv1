// models/Transaction.ts
import connectDB from '@/lib/mongodb';
import mongoose, { Document, Model, Schema } from 'mongoose';

interface ITransaction extends Document {
  customerName: string;
  itemType: string;
  phoneNumber: string;
  weight: number;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    customerName: { 
      type: String, 
      required: [true, 'Nama pelanggan harus diisi'],
      minlength: [3, 'Nama minimal 3 karakter'],
      trim: true
    },
    itemType: { 
      type: String, 
      required: [true, 'Jenis barang harus diisi'],
      enum: {
        values: ['regular', 'express', 'karpet', 'selimut'],
        message: 'Jenis barang {VALUE} tidak valid'
      },
      default: 'regular'
    },
    phoneNumber: { 
      type: String, 
      required: [true, 'Nomor telepon harus diisi'],
      match: [/^08[1-9][0-9]{7,10}$/, 'Format nomor telepon tidak valid'],
      index: true
    },
    weight: { 
      type: Number, 
      required: [true, 'Berat harus diisi'],
      min: [0.1, 'Berat minimal 0.1 kg']
    },
    price: { 
      type: Number, 
      required: [true, 'Harga harus diisi'],
      min: [0, 'Harga tidak boleh negatif']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'cancelled'],
        message: 'Status {VALUE} tidak valid'
      },
      default: 'pending',
      index: true
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

transactionSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

let Transaction: Model<ITransaction>;

export const getTransactionModel = async (): Promise<Model<ITransaction>> => {
  if (!mongoose.models.Transaction) {
    await connectDB();
    Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
  }
  return mongoose.models.Transaction;
};

export type { ITransaction };
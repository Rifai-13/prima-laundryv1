import { Schema, model, models, Document } from "mongoose";
import mongoose from "mongoose";

export interface ISession extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  expires: Date;
}

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Session || mongoose.model('Session', sessionSchema);
import { Schema, model, models, Document } from "mongoose";
import bcrypt from 'bcryptjs';
import mongoose from "mongoose";

export interface IUser extends Document {
  _id:string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Nama harus diisi'],
    trim: true,
    maxlength: [50, 'Nama maksimal 50 karakter']
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Email tidak valid']
  },
  password: {
    type: String,
    required: [true, 'Password harus diisi'],
    minlength: [6, 'Password minimal 6 karakter'],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(new Error(`Gagal mengenkripsi password: ${error.message}`));
  }
});

userSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Gagal memverifikasi password');
  }
};

export default mongoose.models.User || mongoose.model('User', userSchema);
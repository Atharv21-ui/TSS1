import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  isBanned?: boolean;
  address?: string;
  savedPaymentMethod?: {
    cardNumber: string;
    expiry: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    address: {
      type: String,
      trim: true
    },
    savedPaymentMethod: {
      cardNumber: { type: String },
      expiry: { type: String }
    }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);

import { Schema, model, Document } from 'mongoose';

export interface ISpec {
  label: string;
  value: string;
}

export interface IProduct extends Document {
  title: string;
  price: string;
  src: string;
  badge?: string;
  description?: string;
  category: string;
  stock: number;
  specs: ISpec[];
  createdAt: Date;
  updatedAt: Date;
}

const specSchema = new Schema<ISpec>({
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    price: { type: String, required: true },
    src: { type: String, required: true },
    badge: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { 
      type: String, 
      required: true, 
      lowercase: true,
      trim: true
    },
    stock: { type: Number, required: true, default: 0 },
    specs: [specSchema]
  },
  { timestamps: true }
);

export const Product = model<IProduct>('Product', productSchema);

import { db } from '../config/firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export interface ISpec {
  label: string;
  value: string;
}

export interface IProduct {
  id?: string;
  title: string;
  price: string;
  src: string;
  badge?: string;
  description?: string;
  category: string;
  stock: number;
  specs: ISpec[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export const productsCollection = db.collection('products');

import { db } from '../config/firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export interface IUser {
  id?: string;
  name?: string;
  email: string;
  role: 'user' | 'admin';
  isBanned?: boolean;
  address?: string;
  savedPaymentMethod?: {
    cardNumber: string;
    expiry: string;
  };
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export const usersCollection = db.collection('users');

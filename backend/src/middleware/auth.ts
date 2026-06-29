import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { usersCollection } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'user' | 'admin';
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = req.cookies?.token || (authHeader && authHeader.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Fetch the user's role from Firestore
    const userDoc = await usersCollection.doc(decodedToken.uid).get();
    let role: 'user' | 'admin' = 'user';
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      role = userData?.role || 'user';
    }

    req.user = {
      id: decodedToken.uid,
      role
    };
    
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
};

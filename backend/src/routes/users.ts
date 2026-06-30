import { Router, Response } from 'express';
import { usersCollection, IUser } from '../models/User';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { sanitizeString } from '../utils/sanitize';

const router = Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await usersCollection.orderBy('createdAt', 'desc').get();
    const users = snapshot.docs.map(doc => {
      const data = doc.data() as IUser;
      return {
        _id: doc.id,
        id: doc.id,
        ...data
      };
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
});

// Toggle user ban status (Admin only)
router.patch('/:id/ban', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const docRef = usersCollection.doc(req.params.id as string);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = docSnap.data() as IUser;

    if (userData.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban another admin' });
    }

    const newBanStatus = !userData.isBanned;
    await docRef.update({ 
      isBanned: newBanStatus,
      updatedAt: FieldValue.serverTimestamp()
    });

    res.json({ 
      message: newBanStatus ? 'User banned successfully' : 'User unbanned successfully',
      user: {
        id: docRef.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isBanned: newBanStatus
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating user status', error: error.message });
  }
});

// Update user payment info (Self)
router.patch('/me/payment', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const cardNumber = sanitizeString(req.body.cardNumber, 20);
    const expiry = sanitizeString(req.body.expiry, 7);
    
    if (!cardNumber || !expiry) {
      return res.status(400).json({ message: 'Card number and expiry are required' });
    }
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const docRef = usersCollection.doc(req.user.id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedPaymentMethod = { cardNumber, expiry };
    await docRef.update({ 
      savedPaymentMethod,
      updatedAt: FieldValue.serverTimestamp()
    });

    res.json({
      message: 'Payment method saved successfully',
      savedPaymentMethod
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error saving payment method', error: error.message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { usersCollection, IUser } from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { FieldValue } from 'firebase-admin/firestore';

const router = Router();

// Sync User: Called by frontend after Firebase Client Auth
// Ensures a Firestore document exists for the authenticated user.
router.post('/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { email, name, address } = req.body;
    const uid = req.user.id;
    
    const docRef = usersCollection.doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // User doesn't exist in Firestore yet (new registration)
      const newUser: IUser = {
        name: name || '',
        email: email || '',
        role: 'user',
        isBanned: false,
        address: address || '',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await docRef.set(newUser);
      return res.status(201).json({ 
        message: 'User synced successfully', 
        user: { id: uid, ...newUser }
      });
    }

    // User exists
    const userData = docSnap.data() as IUser;
    
    if (userData.isBanned) {
      return res.status(403).json({ message: 'Account suspended. Please contact support.' });
    }

    res.json({
      message: 'User synced successfully',
      user: { id: uid, ...userData }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during sync', error: error.message });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const docRef = await usersCollection.doc(req.user.id).get();
    if (!docRef.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = docRef.data() as IUser;

    res.json({
      id: docRef.id,
      ...user
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching user profile', error: error.message });
  }
});

export default router;

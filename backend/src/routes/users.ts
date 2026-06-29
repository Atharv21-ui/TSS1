import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
});

// Toggle user ban status (Admin only)
router.patch('/:id/ban', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban another admin' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ 
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating user status', error: error.message });
  }
});

export default router;

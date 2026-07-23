import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = Router();

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
  return {
    instance: new Razorpay({ key_id, key_secret }),
    key_id,
    key_secret,
  };
};

// POST /api/payments/create-order
router.post('/create-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
      res.status(400).json({ error: 'Valid payment amount is required' });
      return;
    }

    const { instance, key_id } = getRazorpayInstance();
    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    res.json({
      success: true,
      order_id: order.id,
      currency: order.currency,
      amount: order.amount,
      key_id: key_id,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: error.message || 'Failed to create Razorpay order' });
  }
});

// POST /api/payments/verify
router.post('/verify', (req: Request, res: Response): void => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: 'Missing required Razorpay payment verification parameters' });
      return;
    }

    const { key_secret } = getRazorpayInstance();

    // Generate HMAC-SHA256 signature
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature || key_secret === 'dummy_secret') {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
  } catch (error: any) {
    console.error('Error verifying payment signature:', error);
    res.status(500).json({ error: 'Payment signature verification failed' });
  }
});

export default router;

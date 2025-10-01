const express = require('express');
const Bill = require('../models/Bill');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/bills
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) query.billDate.$lte = new Date(endDate);
    }

    const bills = await Bill.find(query)
      .populate('customer', 'name phone email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bill.countDocuments(query);

    res.json({
      bills,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bills/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('customer')
      .populate('createdBy', 'name email');
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/bills
router.post('/', auth, async (req, res) => {
  try {
    const billData = {
      ...req.body,
      createdBy: req.user._id
    };

    const bill = new Bill(billData);
    await bill.save();

    // Update customer's total purchases and last purchase date
    await Customer.findByIdAndUpdate(bill.customer, {
      $inc: { totalPurchases: bill.finalAmount },
      lastPurchaseDate: bill.billDate
    });

    const populatedBill = await Bill.findById(bill._id)
      .populate('customer')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedBill);
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/bills/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const oldBill = await Bill.findById(req.params.id);
    if (!oldBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customer').populate('createdBy', 'name email');

    // Update customer's total purchases if amount changed
    if (oldBill.finalAmount !== bill.finalAmount) {
      const difference = bill.finalAmount - oldBill.finalAmount;
      await Customer.findByIdAndUpdate(bill.customer._id, {
        $inc: { totalPurchases: difference }
      });
    }

    res.json(bill);
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/bills/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Update customer's total purchases
    await Customer.findByIdAndUpdate(bill.customer, {
      $inc: { totalPurchases: -bill.finalAmount }
    });

    await Bill.findByIdAndUpdate(req.params.id, { status: 'cancelled' });

    res.json({ message: 'Bill cancelled successfully' });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/bills/:id/payment-status
router.put('/:id/payment-status', auth, async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      { new: true }
    ).populate('customer').populate('createdBy', 'name email');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bills/number/:billNumber
router.get('/number/:billNumber', auth, async (req, res) => {
  try {
    const bill = await Bill.findOne({ billNumber: req.params.billNumber })
      .populate('customer')
      .populate('createdBy', 'name email');
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Get bill by number error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
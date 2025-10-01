const express = require('express');
const Bill = require('../models/Bill');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total sales
    const totalSales = await Bill.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    // Monthly sales
    const monthlySales = await Bill.aggregate([
      { 
        $match: { 
          billDate: { $gte: startOfMonth },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    // Yearly sales
    const yearlySales = await Bill.aggregate([
      { 
        $match: { 
          billDate: { $gte: startOfYear },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    // Total bills count
    const totalBills = await Bill.countDocuments({ status: { $ne: 'cancelled' } });

    // Pending payments
    const pendingPayments = await Bill.aggregate([
      { 
        $match: { 
          paymentStatus: { $in: ['pending', 'partial'] },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    // Total customers
    const totalCustomers = await Customer.countDocuments({ isActive: true });

    // Recent bills (last 30 days)
    const recentBillsCount = await Bill.countDocuments({
      billDate: { $gte: last30Days },
      status: { $ne: 'cancelled' }
    });

    // Monthly sales trend (last 12 months)
    const monthlyTrend = await Bill.aggregate([
      {
        $match: {
          billDate: { $gte: new Date(today.getFullYear(), today.getMonth() - 11, 1) },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$billDate' },
            month: { $month: '$billDate' }
          },
          total: { $sum: '$finalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top customers by purchase amount
    const topCustomers = await Bill.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$customer',
          totalPurchases: { $sum: '$finalAmount' },
          billCount: { $sum: 1 }
        }
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' }
    ]);

    // Payment status breakdown
    const paymentStatusBreakdown = await Bill.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          amount: { $sum: '$finalAmount' }
        }
      }
    ]);

    res.json({
      summary: {
        totalSales: totalSales[0]?.total || 0,
        monthlySales: monthlySales[0]?.total || 0,
        yearlySales: yearlySales[0]?.total || 0,
        totalBills,
        pendingPayments: pendingPayments[0]?.total || 0,
        totalCustomers,
        recentBillsCount
      },
      monthlyTrend,
      topCustomers,
      paymentStatusBreakdown
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/sales-report
router.get('/sales-report', auth, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let matchQuery = { status: { $ne: 'cancelled' } };
    if (startDate || endDate) {
      matchQuery.billDate = {};
      if (startDate) matchQuery.billDate.$gte = new Date(startDate);
      if (endDate) matchQuery.billDate.$lte = new Date(endDate);
    }

    let groupByQuery;
    switch (groupBy) {
      case 'month':
        groupByQuery = {
          year: { $year: '$billDate' },
          month: { $month: '$billDate' }
        };
        break;
      case 'week':
        groupByQuery = {
          year: { $year: '$billDate' },
          week: { $week: '$billDate' }
        };
        break;
      default: // day
        groupByQuery = {
          year: { $year: '$billDate' },
          month: { $month: '$billDate' },
          day: { $dayOfMonth: '$billDate' }
        };
    }

    const salesReport = await Bill.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupByQuery,
          totalSales: { $sum: '$finalAmount' },
          totalTax: { $sum: '$totalTax' },
          billCount: { $sum: 1 },
          avgBillAmount: { $avg: '$finalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json(salesReport);
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/tax-report
router.get('/tax-report', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = { status: { $ne: 'cancelled' } };
    if (startDate || endDate) {
      matchQuery.billDate = {};
      if (startDate) matchQuery.billDate.$gte = new Date(startDate);
      if (endDate) matchQuery.billDate.$lte = new Date(endDate);
    }

    const taxReport = await Bill.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalCgst: { $sum: '$totalCgst' },
          totalSgst: { $sum: '$totalSgst' },
          totalIgst: { $sum: '$totalIgst' },
          totalTax: { $sum: '$totalTax' },
          taxableAmount: { $sum: '$subtotal' },
          totalAmount: { $sum: '$finalAmount' }
        }
      }
    ]);

    res.json(taxReport[0] || {});
  } catch (error) {
    console.error('Tax report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
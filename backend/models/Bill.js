const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  hsnCode: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  // Gold/Jewelry specific fields
  purity: {
    type: Number, // e.g., 22, 18 for gold karat
    min: 0,
    max: 24
  },
  weight: {
    type: Number,
    min: 0
  },
  wastage: {
    type: Number,
    min: 0,
    default: 0
  },
  makingCharges: {
    type: Number,
    min: 0,
    default: 0
  },
  huid: {
    type: String,
    trim: true
  },
  // Tax details
  taxableAmount: {
    type: Number,
    required: true,
    min: 0
  },
  cgstRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  cgstAmount: {
    type: Number,
    required: true,
    min: 0
  },
  sgstRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  sgstAmount: {
    type: Number,
    required: true,
    min: 0
  },
  igstRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  igstAmount: {
    type: Number,
    min: 0,
    default: 0
  }
});

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  billDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  items: [billItemSchema],
  
  // Totals
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalCgst: {
    type: Number,
    required: true,
    min: 0
  },
  totalSgst: {
    type: Number,
    required: true,
    min: 0
  },
  totalIgst: {
    type: Number,
    min: 0,
    default: 0
  },
  totalTax: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  roundOffAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Additional details
  notes: {
    type: String,
    trim: true
  },
  termsAndConditions: {
    type: String,
    trim: true
  },
  
  // Payment info
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'upi', 'cheque', 'other'],
    default: 'cash'
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    default: 'draft'
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Auto-increment bill number
billSchema.pre('save', async function(next) {
  if (this.isNew && !this.billNumber) {
    try {
      const lastBill = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
      let nextNumber = 1;
      
      if (lastBill && lastBill.billNumber) {
        const match = lastBill.billNumber.match(/\d+$/);
        if (match) {
          nextNumber = parseInt(match[0]) + 1;
        }
      }
      
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().slice(-2);
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      
      this.billNumber = `AS${year}${month}${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Indexes for efficient queries
billSchema.index({ billNumber: 1 });
billSchema.index({ customer: 1 });
billSchema.index({ billDate: 1 });
billSchema.index({ status: 1 });
billSchema.index({ paymentStatus: 1 });
billSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bill', billSchema);
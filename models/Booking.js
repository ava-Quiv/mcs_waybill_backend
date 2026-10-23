// backend/models/Booking.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
      default: () => 'MCS-' + crypto.randomBytes(4).toString('hex').toUpperCase()
    },
    senderName: { type: String, required: [true, 'Sender name is required'], trim: true, minlength: 3, maxlength: 100 },
    senderPhone: { type: String, required: [true, 'Sender phone number is required'], trim: true, match: [/^(?:\+254|254|0)[17]\d{8}$/, 'Enter a valid Kenyan phone number'] },
    senderEmail: { type: String, required: [true, 'Sender email is required'], trim: true, lowercase: true, maxlength: 254, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address'] },
    senderId: { type: String, required: [true, 'Sender ID number is required'], trim: true, match: [/^\d{7,9}$/, 'Sender ID must contain 7 to 9 digits'] },
    pickupAddress: { type: String, required: [true, 'Pickup address is required'], trim: true, maxlength: 300 },
    destination: { type: String, required: [true, 'Destination is required'], trim: true, maxlength: 300 },
    recipientName: { type: String, required: [true, 'Recipient name is required'], trim: true, minlength: 3, maxlength: 100 },
    recipientPhone: { type: String, required: [true, 'Recipient phone number is required'], trim: true, match: [/^(?:\+254|254|0)[17]\d{8}$/, 'Enter a valid Kenyan phone number'] },
    recipientId: { type: String, required: [true, 'Recipient ID number is required'], trim: true, match: [/^\d{7,9}$/, 'Recipient ID must contain 7 to 9 digits'] },
    parcelType: { type: String, required: [true, 'Parcel type is required'], enum: ['Documents', 'Clothes', 'Electronics', 'Food', 'Small Package', 'Other'] },
    weight: { type: String, required: [true, 'Parcel weight is required'], enum: ['Below 1 kg', '1 - 5 kg', '5 - 10 kg', '10 - 20 kg', 'Above 20 kg'] },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    pickupDate: { type: Date, required: [true, 'Pickup date is required'] },
    pickupTime: { type: String, required: [true, 'Pickup time is required'], match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour time format, e.g. 14:30'] },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'], default: 'Pending', index: true },
    deliveryFee: { type: Number, min: [0, 'Delivery fee cannot be negative'], default: null },
    paymentMethod: { type: String, enum: ['Cash', 'M-Pesa', 'Card'], default: null },
    paymentStatus: { type: String, enum: ['Unpaid', 'Pending', 'Paid', 'Refunded'], default: 'Unpaid' }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Booking', bookingSchema);

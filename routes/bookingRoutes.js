// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Pricing matrix mapping structure
const getDeliveryFee = (weightBracket) => {
  const fees = {
    'Below 1 kg': 250,
    '1 - 5 kg': 450,
    '5 - 10 kg': 750,
    '10 - 20 kg': 1200,
    'Above 20 kg': 2000
  };
  return fees[weightBracket] || 0;
};

// POST Route: Accept Waybill Submissions
router.post('/', async (req, res) => {
  try {
    const bookingPayload = { ...req.body };

    // Inject automated calculated fee safely based on weight selection
    bookingPayload.deliveryFee = getDeliveryFee(bookingPayload.weight);

    // Save structure entry records to DB
    const newBooking = new Booking(bookingPayload);
    const savedBooking = await newBooking.save();

    return res.status(201).json({
      success: true,
      message: 'Waybill created successfully!',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Validation Error Details:', error);
    
    // Check if error is thrown by Mongoose validation parameters block
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    return res.status(500).json({ error: 'Internal system fault logging booking transaction.' });
  }
});

// Optional GET Route: Fetch all bookings (useful later for dashboards)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
});


/* ==========================================================================
   1. USER ACCESSIBLE POST ROUTE
   ========================================================================== */

// POST: Create a new waybill booking
router.post('/', async (req, res) => {
  try {
    const bookingPayload = { ...req.body };
    bookingPayload.deliveryFee = getDeliveryFee(bookingPayload.weight);

    const newBooking = new Booking(bookingPayload);
    const savedBooking = await newBooking.save();

    return res.status(201).json({ success: true, booking: savedBooking });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    return res.status(500).json({ error: 'System fault processing waybill.' });
  }
});

/* ==========================================================================
   2. ADMIN COMPREHENSIVE FILTER VIEWS (GET ROUTES)
   ========================================================================== */

// GET: Fetch all historical bookings (All statuses)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve records.' });
  }
});

// GET: Filter by Delivery Statuses (Pending, Confirmed, Picked Up, In Transit)
// Usage Examples: /api/bookings/status/Pending or /api/bookings/status/In Transit
router.get('/status/:deliveryStatus', async (req, res) => {
  try {
    const { deliveryStatus } = req.params;
    const bookings = await Booking.find({ status: deliveryStatus }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: `Failed to retrieve ${deliveryStatus} bookings.` });
  }
});

// GET: Filter by Payment Statuses (Paid, Refunded, Unpaid, Pending)
// Usage Examples: /api/bookings/payment/Paid or /api/bookings/payment/Refunded
router.get('/payment/:paymentStatus', async (req, res) => {
  try {
    const { paymentStatus } = req.params;
    const bookings = await Booking.find({ paymentStatus: paymentStatus }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: `Failed to retrieve ${paymentStatus} payment records.` });
  }
});

/* ==========================================================================
   3. ADMIN ADMINISTRATIVE UPDATE ACTION (PUT ROUTE)
   ========================================================================== */

// PUT: Modify customer info, update delivery tracking statuses, and switch payment states
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If an administrator edits the parcel metrics weight dropdown, recalculate the bill tier
    if (updateData.weight) {
      updateData.deliveryFee = getDeliveryFee(updateData.weight);
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // Return modified record & enforce schema regex rules
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: 'Waybill database file match not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Operational metrics updated successfully!',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update operation fault:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Internal runtime block occurred saving changes.' });
  }
});



module.exports = router;

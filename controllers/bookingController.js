
const Booking = require('../models/Booking');

// Create a new booking
const createBooking = async (req, res) => {
    try {
        const {
            senderName,
            senderPhone,
            senderEmail,
            senderId,
            pickupAddress,
            destination,
            recipientName,
            recipientPhone,
            recipientId,
            parcelType,
            weight,
            description,
            pickupDate,
            pickupTime,
            notes
        } = req.body;

        // Check required fields
        const requiredFields = {
            senderName,
            senderPhone,
            pickupAddress,
            destination,
            recipientName,
            recipientPhone,
            parcelType,
            weight,
            pickupDate,
            pickupTime
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) =>
                value === undefined || value === null || value === ''
            )
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
                missingFields
            });
        }

        const booking = await Booking.create({
            senderName,
            senderPhone,
            senderEmail,
            senderId,
            pickupAddress,
            destination,
            recipientName,
            recipientPhone,
            recipientId,
            parcelType,
            weight,
            description,
            pickupDate,
            pickupTime,
            notes
        });

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                bookingNumber: booking.bookingNumber,
                status: booking.status,
                pickupDate: booking.pickupDate,
                pickupTime: booking.pickupTime,
                createdAt: booking.createdAt
            }
        });

    } catch (error) {
        console.error('Create booking error:', error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'A booking with this information already exists'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Booking validation failed',
                errors: Object.values(error.errors).map(
                    err => err.message
                )
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while creating booking'
        });
    }
};

// Get all bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .select('-senderId -recipientId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve bookings'
        });
    }
};

// Track a booking by booking number
const getBookingByNumber = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            bookingNumber: req.params.bookingNumber
        }).select(
            'bookingNumber status pickupDate pickupTime parcelType destination createdAt'
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        return res.status(200).json({
            success: true,
            booking
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to track booking'
        });
    }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const allowedStatuses = [
            'Pending',
            'Confirmed',
            'Picked Up',
            'In Transit',
            'Out for Delivery',
            'Delivered',
            'Cancelled',
            'Failed'
        ];

        const { status } = req.body;

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking status'
            });
        }

        const booking = await Booking.findOneAndUpdate(
            { bookingNumber: req.params.bookingNumber },
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Booking status updated',
            booking: {
                bookingNumber: booking.bookingNumber,
                status: booking.status
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update booking status'
        });
    }
};

// Delete booking
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({
            bookingNumber: req.params.bookingNumber
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Booking deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete booking'
        });
    }
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingByNumber,
    updateBookingStatus,
    deleteBooking
};
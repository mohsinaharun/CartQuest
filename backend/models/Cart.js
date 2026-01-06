const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One cart per user
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        variant: {
            size: String,
            color: String
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: { // Snapshot of price at time of add, but allow updates
            type: Number,
            required: true
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    appliedCoupon: {
        code: String,
        discount: Number // Percentage
    }
}, {
    timestamps: true
});

cartSchema.methods.calculateTotal = function () {
    const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (this.appliedCoupon && this.appliedCoupon.discount) {
        const discountAmount = (subtotal * this.appliedCoupon.discount) / 100;
        return subtotal - discountAmount;
    }
    return subtotal;
};

module.exports = mongoose.model('Cart', cartSchema);

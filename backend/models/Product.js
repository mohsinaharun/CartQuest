const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    basePrice: {
        type: Number,
        required: [true, 'Please add a base price'],
        min: 0
    },
    images: [{
        type: String, // URLs to images
        required: true
    }],
    variants: [{
        size: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        price: { // Override base price if different
            type: Number,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        sku: {
            type: String,
            unique: true
        }
    }],
    attributes: { // Generic attributes for filtering
        material: String,
        brand: String,
        gender: {
            type: String,
            enum: ['Men', 'Women', 'Unisex', 'Kids']
        }
    },
    averageRating: {
        type: Number,
        min: 1,
        max: 5
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for search
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ basePrice: 1 });

module.exports = mongoose.model('Product', productSchema);

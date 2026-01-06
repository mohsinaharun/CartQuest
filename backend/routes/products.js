const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
router.get('/', async (req, res) => {
    try {
        let query;
        const reqQuery = { ...req.query };

        // Fields to exclude from filtering
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string for advanced filtering (gt, gte, etc)
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Product.find(JSON.parse(queryStr)).populate('category', 'name slug');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Product.countDocuments(JSON.parse(queryStr));

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const products = await query;

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.json({
            success: true,
            count: products.length,
            total,
            pagination,
            data: products
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true, data: product });
    } catch (err) {
        console.error(err);
        // Mongoose bad ObjectId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin)
// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin)
router.post('/', auth, admin, async (req, res) => {
    try {
        console.log('[DEBUG] POST /api/products reached. Body:', req.body);
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            console.error('Duplicate Key Error:', err.keyValue);
            return res.status(400).json({
                success: false,
                error: 'Duplicate field value',
                keyValue: err.keyValue
            });
        }
        res.status(400).json({ success: false, error: err.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin)
router.put('/:id', auth, admin, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: product });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Soft delete or hard delete? Let's do hard delete for now as per previous logic implied? 
        // Usually soft delete is better (isActive: false). 
        // Requirement said: "Edit or delete products". Let's do deleteOne.
        await product.deleteOne();

        res.json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;

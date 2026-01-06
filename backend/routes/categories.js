const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');
// Admin middleware placeholder - in a real app, you'd check role
const admin = auth;

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort('name');
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private (Admin)
router.post('/', admin, async (req, res) => {
    try {
        const { name, image, description } = req.body;

        let category = await Category.findOne({ name });
        if (category) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        category = new Category({
            name,
            image,
            description
        });

        await category.save();
        res.status(201).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Admin)
router.put('/:id', admin, async (req, res) => {
    try {
        const { name, image, description } = req.body;

        // Find by ID and update
        let category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        // Update fields if they exist
        if (name) category.name = name;
        if (image) category.image = image;
        if (description) category.description = description;

        // If name changed, pre-save hook will update slug usually, but with findByIdAndUpdate it might not.
        // We used .findById() then .save() so middleware WILL run.
        await category.save();

        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin)
router.delete('/:id', admin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        // Use deleteOne() to trigger middleware if any, or just remove
        await category.deleteOne();

        res.json({ message: 'Category removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

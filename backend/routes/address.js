const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const auth = require('../middleware/auth');

// Get all addresses for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single address by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json(address);
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new address
router.post('/', auth, async (req, res) => {
  try {
    const { fullName, phoneNumber, addressLine1, addressLine2, city, state, zipCode, country, isDefault } = req.body;
    
    if (!fullName || !phoneNumber || !addressLine1 || !city || !state || !zipCode) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user.id },
        { isDefault: false }
      );
    }
    
    const address = new Address({
      userId: req.user.id,
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country: country || 'Bangladesh',
      isDefault: isDefault || false
    });
    
    const savedAddress = await address.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(400).json({ message: 'Failed to add address', error: error.message });
  }
});

// Update address
router.put('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    if (req.body.isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId: req.user.id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }
    
    const allowedUpdates = ['fullName', 'phoneNumber', 'addressLine1', 'addressLine2', 'city', 'state', 'zipCode', 'country', 'isDefault'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });
    
    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(400).json({ message: 'Failed to update address', error: error.message });
  }
});

// Delete address
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json({ message: 'Address deleted successfully', deletedAddress: address });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set address as default
router.patch('/:id/set-default', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    await Address.updateMany(
      { userId: req.user.id },
      { isDefault: false }
    );
    
    address.isDefault = true;
    await address.save();
    
    res.json(address);
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
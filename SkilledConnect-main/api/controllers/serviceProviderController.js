import { validationResult } from 'express-validator';
import ServiceProvider from '../models/ServiceProvider.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// Register as service provider
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { businessName, category, description, experience, services } = req.body;
    const userId = req.user.userId;

    // Check if user is already a service provider
    const existingProvider = await ServiceProvider.findOne({ userId });
    if (existingProvider) {
      return res.status(400).json({ message: 'User is already a service provider' });
    }

    // Create service provider profile
    const serviceProvider = await ServiceProvider.create({
      userId,
      businessName,
      category,
      description,
      experience,
      services: JSON.parse(services),
    });

    // Update user role
    await User.findByIdAndUpdate(userId, { role: 'provider' });

    res.status(201).json({
      message: 'Service provider profile created successfully',
      serviceProvider,
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update service provider profile
export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const serviceProvider = await ServiceProvider.findOne({ userId: req.user.userId });

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    // Handle portfolio image uploads
    if (req.files?.portfolio) {
      const portfolioImages = await Promise.all(
        req.files.portfolio.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          return {
            title: file.originalname,
            imageUrl: result.secure_url,
          };
        })
      );
      updates.portfolio = [...(serviceProvider.portfolio || []), ...portfolioImages];
    }

    // Update service provider
    Object.assign(serviceProvider, updates);
    await serviceProvider.save();

    res.json({
      message: 'Profile updated successfully',
      serviceProvider,
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get service provider profile
export const getProfile = async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findOne({ userId: req.user.userId })
      .populate('userId', 'name phone email');

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    res.json({ serviceProvider });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search service providers
export const search = async (req, res) => {
  try {
    const { category, location } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (location) {
      const [lng, lat] = location.split(',').map(Number);
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: 10000, // 10km radius
        },
      };
    }

    const providers = await ServiceProvider.find(query)
      .populate('userId', 'name phone')
      .sort({ rating: -1 });

    res.json({ providers });
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get service provider by ID
export const getById = async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findById(req.params.id)
      .populate('userId', 'name phone email');

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    res.json({ serviceProvider });
  } catch (error) {
    console.error('Error in getById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update availability
export const updateAvailability = async (req, res) => {
  try {
    const { workingDays, workingHours } = req.body;
    const serviceProvider = await ServiceProvider.findOne({ userId: req.user.userId });

    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    serviceProvider.availability = { workingDays, workingHours };
    await serviceProvider.save();

    res.json({
      message: 'Availability updated successfully',
      availability: serviceProvider.availability,
    });
  } catch (error) {
    console.error('Error in updateAvailability:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 
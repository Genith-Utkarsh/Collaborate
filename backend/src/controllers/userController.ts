import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Get user profile by ID
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');
    
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
      return;
    }

    const {
      name,
      bio,
      year,
      branch,
      githubProfile,
      linkedinProfile,
      portfolioUrl,
      skills
    } = req.body;

    const updateData: any = {
      name,
      bio,
      year,
      branch,
      githubProfile,
      linkedinProfile,
      portfolioUrl,
      skills: Array.isArray(skills) ? skills : skills?.split(',').map((s: string) => s.trim())
    };

    // Handle avatar upload
    if (req.file) {
      updateData.avatar = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get all users with pagination
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const { search, year, branch } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    if (year && year !== 'all') {
      filter.year = year;
    }
    
    if (branch && branch !== 'all') {
      filter.branch = branch;
    }
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Follow user
export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    
    if (id === req.user._id.toString()) {
      res.status(400).json({
        status: 'error',
        message: 'Cannot follow yourself'
      });
      return;
    }
    
    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    
    if (!userToFollow || !currentUser) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }
    
    // Check if already following
    if (currentUser.following.includes(userToFollow._id as any)) {
      res.status(400).json({
        status: 'error',
        message: 'Already following this user'
      });
      return;
    }
    
    // Add to following/followers
    currentUser.following.push(userToFollow._id as any);
    userToFollow.followers.push(currentUser._id as any);
    
    await Promise.all([currentUser.save(), userToFollow.save()]);
    
    res.status(200).json({
      status: 'success',
      message: 'User followed successfully'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Unfollow user
export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    
    if (id === req.user._id.toString()) {
      res.status(400).json({
        status: 'error',
        message: 'Cannot unfollow yourself'
      });
      return;
    }
    
    const userToUnfollow = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    
    if (!userToUnfollow || !currentUser) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }
    
    // Check if actually following
    const followingIndex = currentUser.following.indexOf(userToUnfollow._id as any);
    const followerIndex = userToUnfollow.followers.indexOf(currentUser._id as any);
    
    if (followingIndex === -1) {
      res.status(400).json({
        status: 'error',
        message: 'Not following this user'
      });
      return;
    }
    
    // Remove from following/followers
    currentUser.following.splice(followingIndex, 1);
    userToUnfollow.followers.splice(followerIndex, 1);
    
    await Promise.all([currentUser.save(), userToUnfollow.save()]);
    
    res.status(200).json({
      status: 'success',
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

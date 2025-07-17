import { Request, Response } from 'express';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import githubService from '../services/githubService';

// Get all projects with filtering and pagination
export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    
    const { category, search, featured, tags, sortBy = 'createdAt' } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (tags && typeof tags === 'string') {
      filter.tags = { $in: tags.split(',') };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search as string, 'i')] } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    // Build sort object
    const sort: any = {};
    if (sortBy === 'views') {
      sort.views = -1;
    } else if (sortBy === 'likes') {
      sort.likes = -1;
    } else if (sortBy === 'stars') {
      sort['githubData.stars'] = -1;
    } else if (sortBy === 'updated') {
      sort['githubData.lastUpdated'] = -1;
    } else {
      sort.createdAt = -1;
    }
    
    const projects = await Project.find(filter)
      .populate('owner', 'name avatar year branch githubProfile')
      .populate('collaborators', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Project.countDocuments(filter);
    
    res.status(200).json({
      status: 'success',
      data: {
        projects,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProjects: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get project by ID
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id)
      .populate('owner', 'name avatar year branch bio githubProfile')
      .populate('collaborators', 'name avatar year branch')
      .populate('comments.user', 'name avatar');
    
    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }
    
    // Increment views
    project.views += 1;
    await project.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Create a new project
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
      return;
    }

    const { title, description, longDescription, technologies, tags, category, githubUrl, liveUrl, ownerName } = req.body;

    // Validate GitHub URL
    const isValidGitHub = await githubService.validateGitHubUrl(githubUrl);
    if (!isValidGitHub) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid or inaccessible GitHub repository URL'
      });
      return;
    }

    // Get GitHub repository data
    let githubData;
    try {
      githubData = await githubService.getRepoInfo(githubUrl);
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      githubData = {
        stars: 0,
        forks: 0,
        language: 'Unknown',
        lastUpdated: new Date(),
        contributors: 0
      };
    }

    // Handle logo upload
    let logo = '';
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      logo = req.files[0].filename;
    }

    const project = new Project({
      title,
      description,
      longDescription,
      owner: req.user._id,
      ownerName: ownerName || req.user.name, // Use provided owner name or user's name
      technologies: Array.isArray(technologies) 
        ? technologies 
        : technologies 
          ? technologies.split(',').map((t: string) => t.trim())
          : [],
      tags: Array.isArray(tags) 
        ? tags 
        : tags 
          ? tags.split(',').map((t: string) => t.trim()) 
          : [],
      category,
      githubUrl,
      liveUrl,
      logo,
      githubData,
      status: 'active',
      featured: false,
      views: 0,
      likes: [],
      comments: []
    });

    await project.save();
    
    // Populate owner data
    await project.populate('owner', 'name avatar year branch githubProfile');

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: {
        project
      }
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        status: 'error',
        message: 'A project with this GitHub URL already exists'
      });
      return;
    }
    
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

// Update project
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }

    // Check if user owns the project
    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this project'
      });
      return;
    }

    // Handle file uploads
    const newImages = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [];
    
    const updateData = { ...req.body };
    if (newImages.length > 0) {
      updateData.images = [...project.images, ...newImages];
    }

    if (updateData.technologies && typeof updateData.technologies === 'string') {
      updateData.technologies = updateData.technologies.split(',').map((t: string) => t.trim());
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('owner', 'name avatar year branch')
      .populate('collaborators', 'name avatar');

    res.status(200).json({
      status: 'success',
      message: 'Project updated successfully',
      data: {
        project: updatedProject
      }
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    
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

// Delete project
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }

    // Check if user owns the project or is admin
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this project'
      });
      return;
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Like/Unlike project
export const likeProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    const userId = req.user._id as any;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }

    const hasLiked = project.likes.some((likeId: any) => likeId.equals(userId));
    
    if (hasLiked) {
      // Unlike the project
      project.likes = project.likes.filter((likeId: any) => !likeId.equals(userId));
    } else {
      // Like the project
      project.likes.push(userId);
    }

    await project.save();

    res.status(200).json({
      status: 'success',
      message: hasLiked ? 'Project unliked' : 'Project liked',
      data: {
        liked: !hasLiked,
        likesCount: project.likes.length
      }
    });
  } catch (error) {
    console.error('Like project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Refresh GitHub data for a project
export const refreshGitHubData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    
    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }

    // Check if user owns the project
    if (!(project.owner as any).equals(req.user._id)) {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized to refresh GitHub data for this project'
      });
      return;
    }

    try {
      const githubData = await githubService.getRepoInfo(project.githubUrl);
      project.githubData = githubData;
      await project.save();

      res.status(200).json({
        status: 'success',
        message: 'GitHub data refreshed successfully',
        data: {
          githubData
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: 'Failed to fetch GitHub data. Please check if the repository is accessible.'
      });
    }
  } catch (error) {
    console.error('Refresh GitHub data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get project README from GitHub
export const getProjectReadme = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }

    const readme = await githubService.getRepoReadme(project.githubUrl);
    
    res.status(200).json({
      status: 'success',
      data: {
        readme
      }
    });
  } catch (error) {
    console.error('Get README error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get project contributors from GitHub
export const getProjectContributors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }

    const contributors = await githubService.getRepoContributors(project.githubUrl);
    
    res.status(200).json({
      status: 'success',
      data: {
        contributors
      }
    });
  } catch (error) {
    console.error('Get contributors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Add comment to project
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Comment text is required'
      });
      return;
    }

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }

    const comment = {
      user: req.user._id as any,
      text: text.trim(),
      createdAt: new Date()
    };

    project.comments.push(comment);
    await project.save();

    // Populate the new comment
    await project.populate('comments.user', 'name avatar');

    const newComment = project.comments[project.comments.length - 1];

    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully',
      data: {
        comment: newComment
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get user's own projects
export const getUserProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    
    const projects = await Project.find({ owner: userId })
      .populate('owner', 'name avatar year branch githubProfile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Project.countDocuments({ owner: userId });
    
    res.status(200).json({
      status: 'success',
      data: {
        projects,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProjects: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

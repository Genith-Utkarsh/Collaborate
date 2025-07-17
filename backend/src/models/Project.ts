import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  longDescription?: string;
  owner: mongoose.Types.ObjectId;
  ownerName: string; // Add owner name field
  collaborators: mongoose.Types.ObjectId[];
  technologies: string[];
  tags: string[];
  category: string;
  githubUrl: string;
  liveUrl?: string;
  logo?: string;
  images: string[];
  likes: mongoose.Types.ObjectId[];
  githubData?: {
    stars: number;
    forks: number;
    language: string;
    lastUpdated: Date;
    contributors: number;
  };
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  status: 'active' | 'completed' | 'archived';
  featured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  longDescription: {
    type: String,
    maxlength: [2000, 'Long description cannot exceed 2000 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true,
    maxlength: [50, 'Owner name cannot exceed 50 characters']
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  technologies: [{
    type: String,
    required: true,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    enum: ['Web3', 'ML', 'DevTool', 'AI', 'Blockchain', 'Mobile', 'Web', 'Data Science', 'IoT', 'AR/VR', 'Game Dev', 'Other']
  }],
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: [
      'Web Development',
      'Mobile Development',
      'AI/ML',
      'Data Science',
      'IoT',
      'Blockchain',
      'Game Development',
      'Desktop Applications',
      'DevOps',
      'Cybersecurity',
      'AR/VR',
      'Other'
    ]
  },
  githubUrl: {
    type: String,
    required: [true, 'GitHub URL is required'],
    validate: {
      validator: function(v: string) {
        return /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/.test(v);
      },
      message: 'Please enter a valid GitHub repository URL'
    }
  },
  liveUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid live URL'
    }
  },
  logo: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  githubData: {
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    language: { type: String, default: '' },
    lastUpdated: { type: Date },
    contributors: { type: Number, default: 0 }
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ owner: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ createdAt: -1 });

export default mongoose.model<IProject>('Project', projectSchema);

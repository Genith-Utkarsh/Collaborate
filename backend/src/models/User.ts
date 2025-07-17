import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Make password optional for OAuth users
  avatar?: string;
  bio?: string;
  year: string;
  branch: string;
  githubProfile?: string;
  githubId?: string; // For GitHub OAuth
  githubUsername?: string; // GitHub username
  linkedinProfile?: string;
  portfolioUrl?: string;
  skills: string[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  isVerified: boolean;
  role: 'student' | 'admin';
  authProvider: 'local' | 'github';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return this.authProvider === 'local';
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  year: {
    type: String,
    required: [true, 'Year is required'],
    enum: ['First Year', 'Second Year', 'Third Year', 'Final Year', 'Alumni']
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    enum: [
      'Computer Science',
      'Information Technology', 
      'Electronics',
      'Mechanical',
      'Civil',
      'Chemical',
      'Electrical',
      'Biomedical',
      'Aerospace',
      'Other'
    ]
  },
  githubProfile: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^https:\/\/github\.com\/[\w-]+\/?$/.test(v);
      },
      message: 'Please enter a valid GitHub profile URL'
    }
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  githubUsername: {
    type: String,
    sparse: true,
    trim: true
  },
  linkedinProfile: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^https:\/\/www\.linkedin\.com\/in\/[\w-]+\/?$/.test(v);
      },
      message: 'Please enter a valid LinkedIn profile URL'
    }
  },
  portfolioUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid portfolio URL'
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  authProvider: {
    type: String,
    enum: ['local', 'github'],
    default: 'local'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model<IUser>('User', userSchema);

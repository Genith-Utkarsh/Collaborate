import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Configure GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user already exists with GitHub ID
      let user = await User.findOne({ githubId: profile.id });
      
      if (user) {
        // User exists, update their info
        user.githubUsername = profile.username;
        user.avatar = profile.photos?.[0]?.value || user.avatar;
        await user.save();
        return done(null, user);
      }

      // Check if user exists with same email
      const existingEmailUser = await User.findOne({ 
        email: profile.emails?.[0]?.value?.toLowerCase() 
      });
      
      if (existingEmailUser) {
        // Link GitHub account to existing user
        existingEmailUser.githubId = profile.id;
        existingEmailUser.githubUsername = profile.username;
        existingEmailUser.authProvider = 'github';
        existingEmailUser.avatar = profile.photos?.[0]?.value || existingEmailUser.avatar;
        await existingEmailUser.save();
        return done(null, existingEmailUser);
      }

      // Create new user
      const newUser = new User({
        name: profile.displayName || profile.username,
        email: profile.emails?.[0]?.value?.toLowerCase() || `${profile.username}@github.local`,
        githubId: profile.id,
        githubUsername: profile.username,
        authProvider: 'github',
        avatar: profile.photos?.[0]?.value,
        year: 'Not specified',
        branch: 'Not specified'
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

// Generate JWT token
const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, year, branch, bio, skills } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
      return;
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      year,
      branch,
      bio,
      skills: skills || []
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
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
      message: 'Internal server error during registration'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
      return;
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Remove password from response
    user.password = undefined as any;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during login'
    });
  }
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        status: 'error',
        message: 'Token is required'
      });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        status: 'error',
        message: 'JWT secret not configured'
      });
      return;
    }

    // Verify the existing token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }

    // Generate new token
    const newToken = generateToken(user._id.toString());

    res.status(200).json({
      status: 'success',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Token has expired'
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
      return;
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// GitHub OAuth login
export const githubLogin = passport.authenticate('github', {
  scope: ['user:email']
});

// GitHub OAuth callback
export const githubCallback = (req: Request, res: Response): void => {
  passport.authenticate('github', { failureRedirect: '/login' }, async (err: any, user: IUser) => {
    if (err) {
      console.error('GitHub OAuth callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
      return;
    }

    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      return;
    }

    try {
      // Generate JWT token
      const token = generateToken(user._id.toString());
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_error`);
    }
  })(req, res);
};

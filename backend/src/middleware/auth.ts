import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        status: 'error',
        message: 'JWT secret not configured'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is valid but user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Server error during authentication'
    });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }

  next();
};

export { AuthRequest };

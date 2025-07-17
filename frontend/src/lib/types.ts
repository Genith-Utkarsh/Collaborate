export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  year: string;
  branch: string;
  githubProfile?: string;
  linkedinProfile?: string;
  portfolioUrl?: string;
  skills: string[];
  followers: string[];
  following: string[];
  isVerified: boolean;
  role: 'student' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  owner: User;
  collaborators: User[];
  technologies: string[];
  category: string;
  githubUrl: string;
  liveUrl?: string;
  images: string[];
  likes: string[];
  comments: Comment[];
  status: 'active' | 'completed' | 'archived';
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalProjects?: number;
  totalUsers?: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: PaginationData;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationData;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  year: string;
  branch: string;
  bio?: string;
  skills?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const BRANCHES = [
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
] as const;

export const YEARS = [
  'First Year',
  'Second Year',
  'Third Year',
  'Final Year',
  'Alumni'
] as const;

export const CATEGORIES = [
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
] as const;

export type Branch = typeof BRANCHES[number];
export type Year = typeof YEARS[number];
export type Category = typeof CATEGORIES[number];

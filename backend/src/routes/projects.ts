import { Router } from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  likeProject,
  addComment,
  refreshGitHubData,
  getProjectReadme,
  getProjectContributors,
  getUserProjects
} from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Protected routes that need to come before :id routes
router.get('/my-projects', authenticate, getUserProjects);

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.get('/:id/readme', getProjectReadme);
router.get('/:id/contributors', getProjectContributors);

// Other protected routes
router.post('/', authenticate, upload.single('logo'), createProject);
router.put('/:id', authenticate, upload.array('images', 5), updateProject);
router.delete('/:id', authenticate, deleteProject);
router.post('/:id/like', authenticate, likeProject);
router.post('/:id/comments', authenticate, addComment);
router.post('/:id/refresh-github', authenticate, refreshGitHubData);

export default router;

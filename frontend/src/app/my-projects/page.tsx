'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, Github, ExternalLink, Star, GitFork, Users, Heart } from 'lucide-react';
import Link from 'next/link';
import { getLanguageClass } from '@/utils/languages';

interface Project {
  _id: string;
  title: string;
  description: string;
  ownerName: string;
  githubUrl: string;
  tags: string[];
  logoUrl?: string;
  githubData: {
    stars: number;
    forks: number;
    language: string;
    updatedAt: string;
  };
  likes: string[];
  createdAt: string;
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const result = await response.json();
      setProjects(result.data?.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(p => p._id !== projectId));
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">VIT Collaborate</span>
              </Link>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="bg-gray-900/90 backdrop-blur-sm rounded-full px-1 py-1 border border-gray-700/50">
                <div className="flex items-center space-x-1">
                  <Link 
                    href="/projects" 
                    className="px-6 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                  >
                    Projects
                  </Link>
                  <Link 
                    href="/my-projects" 
                    className="px-6 py-2 rounded-full text-sm font-medium text-white bg-gray-800/50 transition-all duration-200"
                  >
                    My Projects
                  </Link>
                  <Link 
                    href="/submit" 
                    className="px-6 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                  >
                    Submit
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center">
              <Link 
                href="/login" 
                className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">My Projects</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Manage and showcase your innovative projects
            </p>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search your projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
            <Link
              href="/submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Project</span>
            </Link>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <Github className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                <p className="text-gray-400 mb-6">
                  {projects.length === 0 
                    ? "You haven't submitted any projects yet. Start by adding your first project!" 
                    : "No projects match your search criteria."}
                </p>
              </div>
              <Link
                href="/submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Submit Your First Project</span>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
}

function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300 hover:shadow-2xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {project.logoUrl ? (
              <img
                src={project.logoUrl}
                alt={project.title}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Github className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                <Link href={`/projects/${project._id}`}>
                  {project.title}
                </Link>
              </h3>
              <p className="text-sm text-gray-400">
                by {project.ownerName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onDelete(project._id)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-md hover:bg-gray-700/50"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs font-medium">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* GitHub Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          {project.githubData && (
            <>
              <span className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>{project.githubData.stars}</span>
              </span>
              <span className="flex items-center space-x-1">
                <GitFork className="h-3 w-3" />
                <span>{project.githubData.forks}</span>
              </span>
              {project.githubData.language && (
                <span className={`lang-tag ${getLanguageClass(project.githubData.language)}`}>
                  {project.githubData.language}
                </span>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-gray-400">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{project.likes.length}</span>
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(project.createdAt)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50"
              title="View on GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <Link
              href={`/projects/${project._id}`}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

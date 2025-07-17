'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, Github, ExternalLink, Star, GitFork, Users } from 'lucide-react';
import Link from 'next/link';
import { getLanguageClass } from '@/utils/languages';

interface Project {
  _id: string;
  title: string;
  description: string;
  githubUrl: string;
  tags: string[];
  logoUrl?: string;
  author: {
    _id: string;
    username: string;
    name: string;
  };
  githubData: {
    stars: number;
    forks: number;
    language: string;
    updatedAt: string;
  };
  likes: number;
  likedBy: string[];
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

      const response = await fetch('/api/projects/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const result = await response.json();
      setProjects(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}`, {
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <Link href="/" className="text-xl font-semibold">
                Collaborate
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/projects" className="text-gray-400 hover:text-white transition-colors text-sm">
                All Projects
              </Link>
              <Link href="/submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105">
                Submit Project
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">My Projects</h1>
              <p className="text-gray-400 text-lg">Manage and track your submitted projects</p>
            </div>
            <Link 
              href="/submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Link>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-8">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Projects Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-2xl font-bold text-white mb-1">{projects.length}</div>
              <div className="text-gray-400 text-sm">Total Projects</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-2xl font-bold text-white mb-1">
                {projects.reduce((acc, p) => acc + p.likes, 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Likes</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-2xl font-bold text-white mb-1">
                {projects.reduce((acc, p) => acc + (p.githubData?.stars || 0), 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Stars</div>
            </div>
          </div>

          {/* Projects List */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Github className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No projects found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'No projects match your search.' : 'You haven\'t submitted any projects yet.'}
              </p>
              <Link 
                href="/submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105 inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Your First Project
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onDelete={deleteProject}
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
  onDelete: (id: string) => void;
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
    <div className="group bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-300 hover:shadow-lg card-hover">
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
                Created {formatDate(project.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/projects/${project._id}/edit`}
              className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800"
              title="Edit project"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(project._id)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-md hover:bg-gray-800"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
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
            <span key={tag} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* GitHub Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          {project.githubData && (
            <>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
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
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-gray-400">
              <span className="text-sm">{project.likes} likes</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800"
              title="View on GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <Link
              href={`/projects/${project._id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

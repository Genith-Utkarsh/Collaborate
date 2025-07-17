'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, Github, ExternalLink, Star, GitFork, Users } from 'lucide-react';
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
  likes: string[];
  likedBy: string[];
  createdAt: string;
}

const FILTER_TAGS = [
  'All',
  'Web Development',
  'Mobile App',
  'Machine Learning',
  'AI',
  'Blockchain',
  'DevOps',
  'Game Development',
  'IoT',
  'AR/VR',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-liked', label: 'Most Liked' },
  { value: 'most-stars', label: 'Most Stars' }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchQuery, selectedTag, sortBy]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
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

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply tag filter
    if (selectedTag !== 'All') {
      filtered = filtered.filter(project =>
        project.tags.includes(selectedTag)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-liked':
          return b.likes.length - a.likes.length;
        case 'most-stars':
          return (b.githubData?.stars || 0) - (a.githubData?.stars || 0);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleLike = async (projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`/api/projects/${projectId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like project');
      }

      // Refresh projects to get updated like count
      fetchProjects();
    } catch (err) {
      console.error('Error liking project:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Loading amazing projects...</p>
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
              <Link href="/submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105">
                Submit Project
              </Link>
              <Link href="/profile" className="text-gray-400 hover:text-white transition-colors text-sm">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Amazing Projects</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore innovative projects created by talented VIT Pune students
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects, technologies, or authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="lg:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 text-white"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tag Filters */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Filter by category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTER_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                      selectedTag === tag
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-8">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-400">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-6">No projects found matching your criteria.</p>
              <Link href="/submit" className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Submit the First Project
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onLike={handleLike}
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
  onLike: (projectId: string) => void;
}

function ProjectCard({ project, onLike }: ProjectCardProps) {
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
                by {project.author.name}
              </p>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-400 cursor-pointer" />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium hover:bg-gray-700 transition-colors">
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
            <button
              onClick={() => onLike(project._id)}
              className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm">{project.likes.length}</span>
            </button>
            <span className="text-xs text-gray-500">
              {formatDate(project.createdAt)}
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

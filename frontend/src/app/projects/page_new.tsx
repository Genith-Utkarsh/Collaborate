'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, Github, ExternalLink, Star, GitFork, Users } from 'lucide-react';
import Link from 'next/link';

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

  // Mock data for demonstration
  const mockProjects: Project[] = [
    {
      _id: '1',
      title: 'AI Study Assistant',
      description: 'Machine learning application that helps students optimize their study schedules using advanced algorithms',
      githubUrl: 'https://github.com/user/ai-study-assistant',
      tags: ['AI', 'Machine Learning', 'Python'],
      author: {
        _id: '1',
        username: 'john_doe',
        name: 'John Doe'
      },
      githubData: {
        stars: 42,
        forks: 12,
        language: 'Python',
        updatedAt: '2024-01-15'
      },
      likes: 28,
      likedBy: [],
      createdAt: '2024-01-15'
    },
    {
      _id: '2',
      title: 'Campus Navigator',
      description: 'AR-based navigation system for VIT Pune campus with real-time updates and interactive features',
      githubUrl: 'https://github.com/user/campus-navigator',
      tags: ['AR/VR', 'Mobile App', 'React Native'],
      author: {
        _id: '2',
        username: 'jane_smith',
        name: 'Jane Smith'
      },
      githubData: {
        stars: 38,
        forks: 8,
        language: 'JavaScript',
        updatedAt: '2024-01-14'
      },
      likes: 35,
      likedBy: [],
      createdAt: '2024-01-14'
    },
    {
      _id: '3',
      title: 'Energy Monitor',
      description: 'IoT solution for monitoring and optimizing energy consumption in college hostels',
      githubUrl: 'https://github.com/user/energy-monitor',
      tags: ['IoT', 'Web Development', 'Arduino'],
      author: {
        _id: '3',
        username: 'mike_dev',
        name: 'Mike Developer'
      },
      githubData: {
        stars: 29,
        forks: 5,
        language: 'C++',
        updatedAt: '2024-01-13'
      },
      likes: 22,
      likedBy: [],
      createdAt: '2024-01-13'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchQuery, selectedTag, sortBy]);

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
          return b.likes - a.likes;
        case 'most-stars':
          return (b.githubData?.stars || 0) - (a.githubData?.stars || 0);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <Github className="w-4 h-4 text-black" />
              </div>
              <span className="text-xl font-semibold">Collaborate</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/submit" className="text-gray-400 hover:text-white transition-colors text-sm">
                Submit Project
              </Link>
              <div className="text-gray-400 text-sm">Profile</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Discover <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Projects</span>
            </h1>
            <p className="text-gray-400">
              Explore amazing projects built by VIT Pune students
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects, authors, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Tags Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Filter by Category</label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTag === tag
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="md:w-48">
                <label className="block text-sm font-medium mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div key={project._id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 hover:bg-gray-900/70 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Github className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Link
                        href={`/projects/${project._id}`}
                        className="font-semibold text-white group-hover:text-blue-400 cursor-pointer transition-colors"
                      >
                        {project.title}
                      </Link>
                      <p className="text-sm text-gray-400">by {project.author.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{project.likes}</span>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs font-medium">
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      {project.githubData?.language || 'Unknown'}
                    </span>
                    <span className="flex items-center hover:text-yellow-400 transition-colors">
                      <Star className="w-4 h-4 mr-1" />
                      {project.githubData?.stars || 0}
                    </span>
                    <span className="flex items-center hover:text-blue-400 transition-colors">
                      <GitFork className="w-4 h-4 mr-1" />
                      {project.githubData?.forks || 0}
                    </span>
                  </div>
                  <span className="text-xs">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No projects found matching your criteria.</p>
              <Link
                href="/submit"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Submit the First Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

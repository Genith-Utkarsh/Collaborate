'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Users, Code, Heart, Plus, TrendingUp, Calendar, Github, Star, GitFork } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalProjects: number;
  totalLikes: number;
  totalViews: number;
  recentProjects: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalLikes: 0,
    totalViews: 0,
    recentProjects: []
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch user's projects
      const projectsResponse = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const projects = projectsData.data?.projects || [];
        
        const totalLikes = projects.reduce((sum: number, project: any) => sum + (project.likes?.length || 0), 0);
        const totalViews = projects.reduce((sum: number, project: any) => sum + (project.views || 0), 0);
        
        setStats({
          totalProjects: projects.length,
          totalLikes,
          totalViews,
          recentProjects: projects.slice(0, 3)
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Collaborate</span>
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
                    className="px-6 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
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
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-300">Welcome, {user.name}!</span>
              )}
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Welcome back, <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{user?.name || 'User'}</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Here's an overview of your project portfolio
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Code className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Likes</p>
                  <p className="text-2xl font-bold text-white">{stats.totalLikes}</p>
                </div>
                <div className="p-3 bg-pink-500/20 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Views</p>
                  <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href="/submit" 
                  className="flex items-center space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <Plus className="w-5 h-5 text-blue-400" />
                  <span>Submit New Project</span>
                </Link>
                <Link 
                  href="/my-projects" 
                  className="flex items-center space-x-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
                >
                  <User className="w-5 h-5 text-purple-400" />
                  <span>Manage My Projects</span>
                </Link>
                <Link 
                  href="/projects" 
                  className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                >
                  <Users className="w-5 h-5 text-green-400" />
                  <span>Explore Projects</span>
                </Link>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white">{user?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Year</p>
                    <p className="text-white">{user?.year || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Branch</p>
                    <p className="text-white">{user?.branch || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          {stats.recentProjects.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Projects</h3>
                <Link 
                  href="/my-projects" 
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentProjects.map((project: any) => (
                  <div key={project._id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">{project.title}</h4>
                      <p className="text-sm text-gray-400">{project.description}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{project.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>{project.githubData?.stars || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GitFork className="w-4 h-4" />
                        <span>{project.githubData?.forks || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

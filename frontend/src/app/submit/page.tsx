'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Github, Link as LinkIcon, Tag, Users } from 'lucide-react';
import Link from 'next/link';

interface ProjectFormData {
  name: string;
  ownerName: string;
  githubUrl: string;
  shortDescription: string;
  tags: string[];
  category: string;
  logoUrl: string;
}

const POPULAR_TAGS = [
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

export default function SubmitProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    ownerName: '',
    githubUrl: '',
    shortDescription: '',
    tags: [],
    category: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate GitHub URL
      if (!formData.githubUrl.includes('github.com')) {
        throw new Error('Please provide a valid GitHub repository URL');
      }

      // Extract owner and repo from GitHub URL
      const urlParts = formData.githubUrl.replace('https://github.com/', '').split('/');
      if (urlParts.length < 2) {
        throw new Error('Invalid GitHub URL format');
      }

      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.name,
          description: formData.shortDescription,
          githubUrl: formData.githubUrl,
          tags: formData.tags,
          category: formData.category,
          logoUrl: formData.logoUrl || undefined,
          ownerName: formData.ownerName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit project');
      }

      const result = await response.json();
      router.push(`/projects/${result.data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
                  <Upload className="w-4 h-4 text-white" />
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
                    className="px-6 py-2 rounded-full text-sm font-medium text-white bg-gray-800/50 transition-all duration-200"
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

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Submit Your Project</h1>
            <p className="text-gray-400 text-lg">Share your GitHub project with the VIT Pune community</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your project name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                />
              </div>

              {/* Project Owner Name */}
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium mb-2">
                  Project Owner Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="Enter the project owner's name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                />
              </div>

              {/* GitHub URL */}
              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium mb-2">
                  <Github className="inline w-4 h-4 mr-1" />
                  GitHub Repository URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  required
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                />
              </div>

              {/* Short Description */}
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium mb-2">
                  Short Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  required
                  rows={4}
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Briefly describe what your project does and what makes it special"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Tags <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {POPULAR_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Select tags that best describe your project (at least 1 required)
                </p>
              </div>

              {/* Project Logo URL */}
              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium mb-2">
                  <LinkIcon className="inline w-4 h-4 mr-1" />
                  Project Logo URL (Optional)
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Link
                  href="/projects"
                  className="flex-1 px-6 py-3 border border-gray-700 rounded-lg font-medium hover:border-gray-600 hover:bg-gray-800 transition-colors text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || formData.tags.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4 inline" />
                      Submit Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <h3 className="text-sm font-medium text-blue-400 mb-2">What happens next?</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• We'll fetch your repository information from GitHub</li>
              <li>• Your project will appear in the projects list immediately</li>
              <li>• Other students can like and collaborate on your project</li>
              <li>• You can edit project details anytime from your profile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

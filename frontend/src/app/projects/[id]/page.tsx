'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Github, ExternalLink, Star, GitFork, Users, Heart, Calendar, Eye, BookOpen } from 'lucide-react';
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
    description?: string;
  };
  likes: number;
  likedBy: string[];
  createdAt: string;
  readme?: string;
  contributors?: Array<{
    login: string;
    avatar_url: string;
    contributions: number;
  }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'readme' | 'contributors'>('overview');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (params?.id) {
      fetchProject(params.id as string);
    }
  }, [params?.id, router]);

  const fetchProject = async (projectId: string) => {
    try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Project not found');
      }
  const result = await response.json();
  // Worker returns { data: { project, comments? } }
  setProject(result.data?.project || result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!project) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like project');
      }

      // Refresh project data
      fetchProject(project._id);
    } catch (err) {
      console.error('Error liking project:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted mb-6">{error || 'The project you\'re looking for doesn\'t exist.'}</p>
          <Link href="/projects" className="btn btn-primary">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const getGithubRepoInfo = () => {
    const url = project.githubUrl.replace('https://github.com/', '');
    const [owner, repo] = url.split('/');
    return { owner, repo };
  };

  const { owner, repo } = getGithubRepoInfo();

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold gradient-text">
              Collaborate
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/projects" className="text-muted hover:text-foreground transition-colors">
                Projects
              </Link>
              <Link href="/submit" className="btn btn-primary btn-sm">
                Submit Project
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

        {/* Project Header */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex items-center space-x-4">
              {project.logoUrl ? (
                <img
                  src={project.logoUrl}
                  alt={project.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Github className="h-8 w-8 text-accent" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
                <p className="text-muted">
                  Created by <span className="text-foreground font-medium">{project.author?.name || (project as any).ownerName || 'Unknown'}</span>
                </p>
              </div>
            </div>

            <div className="flex-1 lg:text-right">
              <div className="flex flex-wrap gap-2 justify-start lg:justify-end mb-4">
                {project.tags.map((tag) => (
                  <span key={tag} className="badge badge-secondary">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                <button
                  onClick={handleLike}
                  className="btn btn-ghost hover:text-red-400"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {project.likes} Likes
                </button>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <Github className="h-4 w-4 mr-2" />
                  View Repository
                </a>
                <a
                  href={`${project.githubUrl}/fork`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <GitFork className="h-4 w-4 mr-2" />
                  Fork Project
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Stats */}
        {project.githubData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card text-center">
              <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-semibold">{project.githubData.stars}</div>
              <div className="text-sm text-muted">Stars</div>
            </div>
            <div className="card text-center">
              <GitFork className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-semibold">{project.githubData.forks}</div>
              <div className="text-sm text-muted">Forks</div>
            </div>
            <div className="card text-center">
              <Calendar className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-semibold">
                {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <div className="text-sm text-muted">Created</div>
            </div>
            <div className="card text-center">
              {project.githubData.language && (
                <>
                  <div className="w-6 h-6 rounded-full bg-accent mx-auto mb-2"></div>
                  <div className="text-lg font-semibold">{project.githubData.language}</div>
                  <div className="text-sm text-muted">Language</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'readme', label: 'README' },
                { id: 'contributors', label: 'Contributors' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted hover:text-foreground hover:border-muted'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">About this project</h3>
                <p className="text-muted leading-relaxed">
                  {project.description || project.githubData?.description || 'No description available.'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary justify-start"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Visit Repository
                  </a>
                  <a
                    href={`${project.githubUrl}/issues/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary justify-start"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Report Issue
                  </a>
                  <a
                    href={`${project.githubUrl}/fork`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary justify-start"
                  >
                    <GitFork className="h-4 w-4 mr-2" />
                    Fork & Contribute
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'readme' && (
            <div>
              {project.readme ? (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-background-secondary p-4 rounded-lg overflow-auto">
                    {project.readme}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-muted">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No README available for this project.</p>
                  <a
                    href={`${project.githubUrl}#readme`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary mt-4"
                  >
                    View on GitHub
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contributors' && (
            <div>
              {project.contributors && project.contributors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.contributors.map((contributor) => (
                    <div key={contributor.login} className="flex items-center space-x-3 p-3 rounded-lg bg-background-secondary">
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{contributor.login}</div>
                        <div className="text-sm text-muted">
                          {contributor.contributions} contribution{contributor.contributions !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No contributors information available.</p>
                  <a
                    href={`${project.githubUrl}/graphs/contributors`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary mt-4"
                  >
                    View on GitHub
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Projects */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">More from {project.author.name}</h2>
          <div className="text-center py-8 text-muted">
            <p>No other projects found.</p>
            <Link href="/projects" className="btn btn-secondary mt-4">
              Explore All Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

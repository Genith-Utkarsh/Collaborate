'use client';

import Link from 'next/link';
import { Github, Star, Users, Code, GitFork, ArrowRight, ExternalLink } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold">Collaborate</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/projects" className="text-gray-400 hover:text-white transition-colors text-sm">
                Projects
              </Link>
              <Link href="/my-projects" className="text-gray-400 hover:text-white transition-colors text-sm">
                My Projects
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                About
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Showcase Your Projects.<br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Connect with Peers.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              The ultimate platform for VIT Pune students to showcase their GitHub projects, 
              collaborate, and build together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/submit" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Submit Project
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link 
                href="/projects" 
                className="inline-flex items-center px-6 py-3 border border-gray-700 rounded-lg font-medium hover:border-gray-600 hover:bg-gray-900 transition-colors"
              >
                <Github className="mr-2 w-4 h-4" />
                Browse Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-gray-400">Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">1,200+</div>
              <div className="text-sm text-gray-400">Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-sm text-gray-400">Technologies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-gray-400">Open Source</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
              <p className="text-gray-400">Discover the most innovative projects from our community</p>
            </div>
            <Link 
              href="/projects" 
              className="hidden md:inline-flex items-center text-gray-400 hover:text-white transition-colors"
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI-Powered Study Assistant",
                description: "Machine learning application that helps students optimize their study schedules",
                tech: ["Python", "TensorFlow", "React"],
                author: "john_doe",
                stars: 42,
                forks: 12,
                language: "Python"
              },
              {
                title: "Campus Navigation System",
                description: "AR-based navigation system for VIT Pune campus with real-time updates",
                tech: ["React Native", "AR Core", "Node.js"],
                author: "jane_smith",
                stars: 38,
                forks: 8,
                language: "JavaScript"
              },
              {
                title: "Sustainable Energy Monitor",
                description: "IoT solution for monitoring and optimizing energy consumption in hostels",
                tech: ["Arduino", "React", "MongoDB"],
                author: "mike_dev",
                stars: 29,
                forks: 5,
                language: "C++"
              }
            ].map((project, index) => (
              <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 hover:bg-gray-900/70 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Github className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 cursor-pointer transition-colors">{project.title}</h3>
                      <p className="text-sm text-gray-400">by {project.author}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                </div>
                
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, techIndex) => (
                    <span key={techIndex} className="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs font-medium hover:bg-gray-700 transition-colors">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      {project.language}
                    </span>
                    <span className="flex items-center hover:text-yellow-400 transition-colors">
                      <Star className="w-4 h-4 mr-1" />
                      {project.stars}
                    </span>
                    <span className="flex items-center hover:text-blue-400 transition-colors">
                      <GitFork className="w-4 h-4 mr-1" />
                      {project.forks}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Simple steps to showcase your GitHub projects to the VIT Pune community
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Github className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Connect GitHub</h3>
              <p className="text-gray-400 text-sm">
                Link your GitHub repository and we'll automatically fetch project details
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Get Discovered</h3>
              <p className="text-gray-400 text-sm">
                Your project appears in our showcase for peers to discover and collaborate
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Build Network</h3>
              <p className="text-gray-400 text-sm">
                Receive likes, feedback, and connect with potential collaborators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Showcase Your Work?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join hundreds of VIT Pune students who are already showcasing their projects and building their network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/submit" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Submit Your Project
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link 
                href="/projects" 
                className="inline-flex items-center px-6 py-3 border border-gray-700 rounded-lg font-medium hover:border-gray-600 hover:bg-gray-900 transition-colors"
              >
                Browse Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                  <Code className="w-4 h-4 text-black" />
                </div>
                <span className="text-xl font-semibold">Collaborate</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering VIT Pune students to showcase their projects and connect with the community.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/projects" className="hover:text-white transition-colors">Projects</Link></li>
                <li><Link href="/submit" className="hover:text-white transition-colors">Submit</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help</Link></li>
                <li><Link href="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Collaborate. Built with ❤️ by VIT Pune students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

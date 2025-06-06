import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowRight,
  Users,
  Zap,
  Rocket,
  MessageSquare,
  Award,
  Lightbulb
} from 'lucide-react';
import Logo from '../components/shared/Logo';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMmEyYTNhIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPgo8L3N2Zz4=')] opacity-10"></div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <Logo size="lg" variant="light" />
              
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <span className="text-gray-300">Welcome back, {user?.name}!</span>
                    <Link to="/hackboard">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                        Go to the Board
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" className="text-gray-300 hover:text-white">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Hero Content */}
            <div className="mb-16">
              <Badge className="mb-6 bg-amber-500/20 text-amber-300 border-amber-500/30">
                🚀 Your Developer Productivity Hub
              </Badge>
              
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Build, Share, and
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  {' '}Connect
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                The all-in-one platform for developers to manage projects, connect with peers, 
                and showcase their work. From idea to deployment, we've got you covered.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to={isAuthenticated ? "/hackboard" : "/register"}>
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-3">
                    <Rocket className="h-5 w-5 mr-2" />
                    {isAuthenticated ? "Go to Board" : "Start Building"}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                
                <Link to="/hackboard">
                  <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3">
                    <Users className="h-5 w-5 mr-2" />
                    Explore Community
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-[#0f0f1a]/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">Everything You Need to Succeed</h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful tools and features designed to boost your productivity and connect you with the developer community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="p-3 bg-amber-500/20 rounded-lg w-fit mb-4 group-hover:bg-amber-500/30 transition-colors">
                  <Rocket className="h-6 w-6 text-amber-400" />
                </div>
                <CardTitle className="text-white">Project Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Keep your projects organized with notes, tasks, and progress tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="p-3 bg-amber-500/20 rounded-lg w-fit mb-4 group-hover:bg-amber-500/30 transition-colors">
                  <Users className="h-6 w-6 text-amber-400" />
                </div>
                <CardTitle className="text-white">Community Hub</CardTitle>
                <CardDescription className="text-gray-400">
                  Connect with fellow developers, share ideas, and find collaborators.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="p-3 bg-amber-500/20 rounded-lg w-fit mb-4 group-hover:bg-amber-500/30 transition-colors">
                  <Rocket className="h-6 w-6 text-amber-400" />
                </div>
                <CardTitle className="text-white">Showcase Your Work</CardTitle>
                <CardDescription className="text-gray-400">
                  Build your portfolio and get feedback from the community.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="p-3 bg-amber-500/20 rounded-lg w-fit mb-4 group-hover:bg-amber-500/30 transition-colors">
                  <Lightbulb className="h-6 w-6 text-amber-400" />
                </div>
                <CardTitle className="text-white">Learning Resources</CardTitle>
                <CardDescription className="text-gray-400">
                  Access tutorials, examples, and best practices from the community.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="p-3 bg-amber-500/20 rounded-lg w-fit mb-4 group-hover:bg-amber-500/30 transition-colors">
                  <Zap className="h-6 w-6 text-amber-400" />
                </div>
                <CardTitle className="text-white">Real-time Collaboration</CardTitle>
                <CardDescription className="text-gray-400">
                  Work together on projects with real-time updates and communication.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="p-3 bg-amber-500/20 rounded-lg w-fit mb-4 group-hover:bg-amber-500/30 transition-colors">
                  <Award className="h-6 w-6 text-amber-400" />
                </div>
                <CardTitle className="text-white">Achievement System</CardTitle>
                <CardDescription className="text-gray-400">
                  Track your progress and earn recognition for your contributions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-t border-amber-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-amber-400 mb-2">1000+</div>
              <div className="text-gray-300">Active Developers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400 mb-2">500+</div>
              <div className="text-gray-300">Projects Shared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400 mb-2">50+</div>
              <div className="text-gray-300">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400 mb-2">24/7</div>
              <div className="text-gray-300">Community Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6">
              Ready to Build Something Amazing?
            </h3>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of developers who are already using HackBoard to build, 
              learn, and grow their careers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={isAuthenticated ? "/hackboard" : "/register"}>
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-4">
                  <Rocket className="h-5 w-5 mr-2" />
                  {isAuthenticated ? "Go to Board" : "Get Started Free"}
                </Button>
              </Link>
              
              <Link to="/hackboard">
                <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Join the Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#2a2a3a] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="md" variant="light" className="mb-4 md:mb-0" />
            
            <div className="flex space-x-6 text-gray-400">
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link to="/examples" className="hover:text-white transition-colors">Examples</Link>
              <a href="https://github.com/mxn2020/hackboarddev" className="hover:text-white transition-colors">GitHub</a>
              <a href="https://x.com/i/communities/1928861140651520478" className="hover:text-white transition-colors">X</a>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-8 border-t border-[#2a2a3a] text-gray-500">
            <p>&copy; 2025 HackBoard. Built with ❤️ for developers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
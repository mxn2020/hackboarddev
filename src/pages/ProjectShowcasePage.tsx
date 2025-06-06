import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Search, 
  Filter, 
  Award, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  ExternalLink,
  Github,
  Globe,
  Code,
  Rocket,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Project type definition
interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl?: string;
  repoUrl?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  featured?: boolean;
}

// Mock data for projects
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'AI-Powered Task Manager',
    description: 'A task management app that uses AI to prioritize and categorize your tasks automatically. Built with React, Node.js, and OpenAI.',
    imageUrl: 'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    demoUrl: 'https://ai-task-manager.netlify.app',
    repoUrl: 'https://github.com/username/ai-task-manager',
    author: {
      id: 'user1',
      name: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    category: 'productivity',
    tags: ['AI', 'React', 'Node.js', 'OpenAI'],
    likes: 124,
    comments: 18,
    createdAt: '2025-05-15T10:30:00Z',
    featured: true
  },
  {
    id: '2',
    title: 'EcoTrack - Carbon Footprint Calculator',
    description: 'An app that helps users track and reduce their carbon footprint through daily activities. Features interactive visualizations and personalized recommendations.',
    imageUrl: 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    demoUrl: 'https://ecotrack-demo.vercel.app',
    repoUrl: 'https://github.com/username/ecotrack',
    author: {
      id: 'user2',
      name: 'Samantha Lee',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    category: 'sustainability',
    tags: ['Climate', 'React', 'D3.js', 'Firebase'],
    likes: 87,
    comments: 12,
    createdAt: '2025-05-10T14:20:00Z'
  },
  {
    id: '3',
    title: 'MediConnect - Healthcare Platform',
    description: 'A telemedicine platform connecting patients with healthcare providers. Features video consultations, appointment scheduling, and secure messaging.',
    imageUrl: 'https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    demoUrl: 'https://mediconnect-health.netlify.app',
    repoUrl: 'https://github.com/username/mediconnect',
    author: {
      id: 'user3',
      name: 'Dr. Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
    },
    category: 'healthcare',
    tags: ['Telemedicine', 'WebRTC', 'React', 'Express'],
    likes: 156,
    comments: 24,
    createdAt: '2025-05-05T09:15:00Z',
    featured: true
  },
  {
    id: '4',
    title: 'FinLit - Financial Literacy Game',
    description: 'An educational game teaching financial literacy concepts through interactive scenarios and challenges. Targeted at teenagers and young adults.',
    imageUrl: 'https://images.pexels.com/photos/6693661/pexels-photo-6693661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    demoUrl: 'https://finlit-game.vercel.app',
    repoUrl: 'https://github.com/username/finlit',
    author: {
      id: 'user4',
      name: 'Taylor Rodriguez',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
    },
    category: 'education',
    tags: ['Education', 'Game', 'React', 'Three.js'],
    likes: 92,
    comments: 15,
    createdAt: '2025-04-28T16:45:00Z'
  },
  {
    id: '5',
    title: 'LocalEats - Community Food Sharing',
    description: 'A platform connecting local food producers with consumers. Features include marketplace, subscription boxes, and community events calendar.',
    imageUrl: 'https://images.pexels.com/photos/5677794/pexels-photo-5677794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    demoUrl: 'https://localeats-community.netlify.app',
    repoUrl: 'https://github.com/username/localeats',
    author: {
      id: 'user5',
      name: 'Jamie Wilson',
      avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
    },
    category: 'community',
    tags: ['Food', 'Marketplace', 'React', 'Node.js', 'MongoDB'],
    likes: 78,
    comments: 9,
    createdAt: '2025-04-22T11:30:00Z'
  },
  {
    id: '6',
    title: 'CodeMentor AI - Programming Assistant',
    description: 'An AI-powered programming assistant that helps developers debug code, learn new concepts, and improve their coding skills through interactive exercises.',
    imageUrl: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    demoUrl: 'https://codementor-ai.vercel.app',
    repoUrl: 'https://github.com/username/codementor-ai',
    author: {
      id: 'user6',
      name: 'Raj Patel',
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg'
    },
    category: 'developer-tools',
    tags: ['AI', 'Education', 'React', 'Python', 'GPT-4'],
    likes: 215,
    comments: 32,
    createdAt: '2025-04-18T08:20:00Z',
    featured: true
  }
];

// Categories for filtering
const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'community', label: 'Community' },
  { value: 'developer-tools', label: 'Developer Tools' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' }
];

const ProjectShowcasePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');

  // Filter projects based on search, category, and tab
  useEffect(() => {
    let result = [...projects];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project => 
        project.title.toLowerCase().includes(term) || 
        project.description.toLowerCase().includes(term) ||
        project.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(project => project.category === selectedCategory);
    }
    
    // Filter by tab
    if (activeTab === 'featured') {
      result = result.filter(project => project.featured);
    }
    
    // Apply sorting
    result = sortProjects(result, sortBy);
    
    setFilteredProjects(result);
  }, [searchTerm, selectedCategory, sortBy, activeTab, projects]);

  // Sort projects based on selected criteria
  const sortProjects = (projectsToSort: Project[], sortCriteria: string) => {
    switch (sortCriteria) {
      case 'newest':
        return [...projectsToSort].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return [...projectsToSort].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'most-liked':
        return [...projectsToSort].sort((a, b) => b.likes - a.likes);
      case 'most-commented':
        return [...projectsToSort].sort((a, b) => b.comments - a.comments);
      default:
        return projectsToSort;
    }
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Like a project (mock implementation)
  const handleLike = (projectId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to like projects');
      return;
    }
    
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, likes: project.likes + 1 } 
          : project
      )
    );
  };

  // Share a project (mock implementation)
  const handleShare = (project: Project) => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: project.demoUrl || window.location.href,
      })
      .catch(error => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(`Share this project: ${project.title}\n${project.demoUrl || window.location.href}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#0a0a14] border-b border-[#2a2a3a]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/50 to-[#0a0a14]/50 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-10 z-0"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-4 py-1 rounded-full text-amber-300 text-sm font-medium mb-6">
              <Award className="h-4 w-4" />
              <span>Showcase Your Hackathon Projects</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 mb-6">
              Project Showcase
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover amazing projects built by the community, get inspired, and share your own creations with fellow developers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-6 py-3 rounded-full"
                onClick={() => isAuthenticated ? alert('Project submission form would open here') : alert('Please log in to submit a project')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Your Project
              </Button>
              <Button 
                variant="outline" 
                className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 px-6 py-3 rounded-full"
              >
                <Award className="h-4 w-4 mr-2" />
                View Winners
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1a1a2e] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-[#1a1a2e] border-[#2a2a3a] text-gray-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-[#2a2a3a] text-gray-200">
              {CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-[#1a1a2e] border-[#2a2a3a] text-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-[#2a2a3a] text-gray-200">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-liked">Most Liked</SelectItem>
              <SelectItem value="most-commented">Most Commented</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-[#1a1a2e] border border-[#2a2a3a] p-1">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-300"
            >
              All Projects
            </TabsTrigger>
            <TabsTrigger 
              value="featured" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-300"
            >
              Featured
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No projects found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? "Try adjusting your filters or search term"
                : "Be the first to submit a project!"}
            </p>
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-black"
              onClick={() => isAuthenticated ? alert('Project submission form would open here') : alert('Please log in to submit a project')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <Card key={project.id} className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors overflow-hidden">
                {/* Project Image */}
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-gray-100 hover:text-amber-300 transition-colors">
                        {project.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <img 
                          src={project.author.avatar} 
                          alt={project.author.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-400">{project.author.name}</span>
                      </div>
                    </div>
                    <Badge className={`
                      ${project.category === 'productivity' ? 'bg-blue-500/20 text-blue-300' : ''}
                      ${project.category === 'sustainability' ? 'bg-green-500/20 text-green-300' : ''}
                      ${project.category === 'healthcare' ? 'bg-red-500/20 text-red-300' : ''}
                      ${project.category === 'education' ? 'bg-purple-500/20 text-purple-300' : ''}
                      ${project.category === 'community' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                      ${project.category === 'developer-tools' ? 'bg-indigo-500/20 text-indigo-300' : ''}
                    `}>
                      {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="border-amber-500/30 text-amber-300/70 hover:border-amber-500/50 hover:text-amber-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    {project.demoUrl && (
                      <a 
                        href={project.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-amber-300 hover:text-amber-400 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Demo
                      </a>
                    )}
                    {project.repoUrl && (
                      <a 
                        href={project.repoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-amber-300 hover:text-amber-400 transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        Code
                      </a>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {formatRelativeTime(project.createdAt)}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t border-[#2a2a3a] pt-3 flex justify-between">
                  <div className="flex gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-amber-300"
                      onClick={() => handleLike(project.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {project.likes}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-amber-300"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {project.comments}
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-amber-300"
                    onClick={() => handleShare(project)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-t border-amber-500/20 py-16 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Ready to showcase your project?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Share your hackathon creation with the community and get valuable feedback from fellow developers.
          </p>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-8 py-3 rounded-full text-lg"
            onClick={() => isAuthenticated ? alert('Project submission form would open here') : alert('Please log in to submit a project')}
          >
            <Rocket className="h-5 w-5 mr-2" />
            Submit Your Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectShowcasePage;
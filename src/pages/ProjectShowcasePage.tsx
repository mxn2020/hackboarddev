import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
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
  Plus,
  AlertCircle
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
import CreateShowcaseModal from '../components/hackboard/CreateShowcaseModal';
import { toast } from 'sonner';

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
  isLiked?: boolean;
  approved: boolean;
}

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
  const { isAuthenticated, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/showcase/projects');
      
      if (response.data.success) {
        setProjects(response.data.data || []);
      } else {
        setError(response.data.error || 'Failed to load projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
    
    // Only show approved projects
    result = result.filter(project => project.approved);
    
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

  // Like a project
  const handleLike = async (projectId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to like projects');
      return;
    }
    
    try {
      const response = await api.post('/showcase/like', { projectId });
      
      if (response.data.success) {
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === projectId 
              ? { 
                  ...project, 
                  likes: response.data.liked ? project.likes + 1 : project.likes - 1,
                  isLiked: response.data.liked
                } 
              : project
          )
        );
      }
    } catch (err) {
      console.error('Error liking project:', err);
      // Optimistic UI update fallback
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                likes: project.isLiked ? project.likes - 1 : project.likes + 1,
                isLiked: !project.isLiked
              } 
            : project
        )
      );
    }
  };

  // Share a project
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

  // Helper: Detect seed/demo items
  const isSeedProject = (project: Project) =>
    project.author?.name === 'Demo User' || project.author?.id === 'seed';

  // Helper: Only seed items?
  const onlySeedProjects =
    filteredProjects.length > 0 && filteredProjects.every(isSeedProject);

  // Handle project submission
  const handleCreateProject = async (projectData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/showcase/projects', projectData);
      if (response.data.success) {
        // Only add to list if approved
        if (response.data.data.approved) {
          setProjects([response.data.data, ...projects]);
          toast.success('Project submitted and approved!');
        } else {
          toast.success('Project submitted and is pending approval. It will appear once approved.');
        }
        setIsCreateModalOpen(false);
      } else {
        setError(response.data.error || 'Failed to submit project');
        toast.error(response.data.error || 'Failed to submit project');
      }
    } catch (err) {
      setError('Failed to submit project. Please try again.');
      toast.error('Failed to submit project. Please try again.');
    } finally {
      setIsLoading(false);
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
                onClick={() => setIsCreateModalOpen(true)}
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

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-400 mb-2">Error Loading Projects</h3>
                <p className="text-gray-300">{error}</p>
                <Button 
                  onClick={fetchProjects} 
                  variant="outline" 
                  className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

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
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit Project
            </Button>
          </div>
        ) : (
          <div className="relative">
            {onlySeedProjects && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a14]/80 pointer-events-none">
                <Award className="h-16 w-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No real projects yet</h3>
                <p className="text-gray-400 mb-6 max-w-md">Be the first to submit your hackathon project and inspire the community!</p>
                <Button className="bg-amber-500 hover:bg-amber-600 text-black" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Project
                </Button>
              </div>
            )}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${onlySeedProjects ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              {filteredProjects.map(project => {
                const isSeed = isSeedProject(project);
                return (
                  <Card
                    key={project.id}
                    className={`bg-[#1a1a2e] border-[#2a2a3a] transition-colors overflow-hidden ${isSeed ? 'opacity-40 pointer-events-none select-none' : 'hover:border-amber-500/30'}`}
                  >
                    {/* Project Image + Upvote Button */}
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <button
                        className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full shadow-lg text-base font-semibold transition-colors
                          ${project.isLiked ? 'bg-amber-400 text-black' : 'bg-[#181825]/80 text-gray-200 hover:bg-amber-500/80 hover:text-black'}
                          ${isSeed ? 'pointer-events-none opacity-50' : ''}`}
                        onClick={() => handleLike(project.id)}
                        disabled={isSeed}
                        aria-label={project.isLiked ? 'Remove upvote' : 'Upvote'}
                      >
                        <ThumbsUp className={`h-5 w-5 ${project.isLiked ? 'fill-black' : 'fill-none'}`} />
                        {project.likes}
                      </button>
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
                          disabled={isSeed}
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
                        disabled={isSeed}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
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
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Rocket className="h-5 w-5 mr-2" />
            Submit Your Project
          </Button>
        </div>
      </div>

      {/* Modal for project submission */}
      <CreateShowcaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default ProjectShowcasePage;
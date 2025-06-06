import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  Search, 
  BookOpen, 
  Code, 
  Palette, 
  Database, 
  Cpu, 
  Lightbulb, 
  Download,
  ExternalLink,
  Star,
  Filter,
  ChevronRight,
  FileText,
  Video,
  Headphones,
  Bookmark,
  Share2,
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

// Resource type definition
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  type: 'article' | 'video' | 'tool' | 'template' | 'course' | 'book' | 'podcast' | 'library';
  category: string;
  tags: string[];
  author: string;
  publishedDate: string;
  featured?: boolean;
  stars?: number;
  isFree: boolean;
  isBookmarked?: boolean;
}

// Categories for filtering
const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'design', label: 'Design' },
  { value: 'database', label: 'Database' },
  { value: 'ai', label: 'AI & Machine Learning' },
  { value: 'web3', label: 'Web3 & Blockchain' },
  { value: 'trends', label: 'Trends & News' }
];

// Resource types for filtering
const RESOURCE_TYPES = [
  { value: 'all', label: 'All Types', icon: BookOpen },
  { value: 'article', label: 'Articles', icon: FileText },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'tool', label: 'Tools', icon: Code },
  { value: 'template', label: 'Templates', icon: Palette },
  { value: 'course', label: 'Courses', icon: BookOpen },
  { value: 'book', label: 'Books', icon: BookOpen },
  { value: 'podcast', label: 'Podcasts', icon: Headphones },
  { value: 'library', label: 'Libraries', icon: Database }
];

const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch resources from API
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/showcase/resources');
      
      if (response.data.success) {
        setResources(response.data.data || []);
      } else {
        setError(response.data.error || 'Failed to load resources');
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter resources based on search, category, type, and tab
  useEffect(() => {
    let result = [...resources];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(resource => 
        resource.title.toLowerCase().includes(term) || 
        resource.description.toLowerCase().includes(term) ||
        resource.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(resource => resource.category === selectedCategory);
    }
    
    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter(resource => resource.type === selectedType);
    }
    
    // Filter by free/paid
    if (showFreeOnly) {
      result = result.filter(resource => resource.isFree);
    }
    
    // Filter by tab
    if (activeTab === 'featured') {
      result = result.filter(resource => resource.featured);
    }
    
    setFilteredResources(result);
  }, [searchTerm, selectedCategory, selectedType, showFreeOnly, activeTab, resources]);

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

  // Get icon for resource type
  const getResourceTypeIcon = (type: string) => {
    const resourceType = RESOURCE_TYPES.find(t => t.value === type);
    if (!resourceType) return BookOpen;
    return resourceType.icon;
  };

  // Bookmark a resource
  const handleBookmark = async (resourceId: string) => {
    try {
      const response = await api.post('/showcase/bookmark', { resourceId });
      
      if (response.data.success) {
        setResources(prevResources => 
          prevResources.map(resource => 
            resource.id === resourceId 
              ? { ...resource, isBookmarked: response.data.bookmarked } 
              : resource
          )
        );
      }
    } catch (err) {
      console.error('Error bookmarking resource:', err);
      alert('Failed to bookmark resource. Please try again.');
    }
  };

  // Share a resource
  const handleShare = (resource: Resource) => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: resource.url,
      })
      .catch(error => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(`Share this resource: ${resource.title}\n${resource.url}`);
    }
  };

  // Submit a new resource
  const handleSubmitResource = () => {
    alert('Resource submission form would open here');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#0a0a14] border-b border-[#2a2a3a]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/50 to-[#0a0a14]/50 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-10 z-0"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-4 py-1 rounded-full text-amber-300 text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" />
              <span>Learning Resources for Developers</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 mb-6">
              Developer Resources
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover curated resources to help you build better projects, learn new skills, and stay up-to-date with the latest technologies.
            </p>
            
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search for resources, tools, tutorials..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-6 bg-[#1a1a2e]/80 border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50 rounded-full text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Resource Type Tabs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Browse by Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {RESOURCE_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "outline"}
                  className={`flex flex-col items-center justify-center h-24 ${
                    selectedType === type.value 
                      ? "bg-amber-500 text-black border-amber-500" 
                      : "border-[#2a2a3a] text-gray-300 hover:border-amber-500/50 hover:text-amber-300"
                  }`}
                  onClick={() => setSelectedType(type.value)}
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span>{type.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
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
          
          <Button
            variant={showFreeOnly ? "default" : "outline"}
            className={`${
              showFreeOnly 
                ? "bg-amber-500 text-black" 
                : "border-[#2a2a3a] text-gray-300 hover:border-amber-500/50"
            }`}
            onClick={() => setShowFreeOnly(!showFreeOnly)}
          >
            {showFreeOnly ? "Free Resources Only ✓" : "Free Resources Only"}
          </Button>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="ml-auto">
            <TabsList className="bg-[#1a1a2e] border border-[#2a2a3a] p-1">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-300"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="featured" 
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-300"
              >
                Featured
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-400 mb-2">Error Loading Resources</h3>
                <p className="text-gray-300">{error}</p>
                <Button 
                  onClick={fetchResources} 
                  variant="outline" 
                  className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Resources Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No resources found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or search term
            </p>
            <Button 
              variant="outline"
              className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
                setShowFreeOnly(false);
                setActiveTab('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => {
              const TypeIcon = getResourceTypeIcon(resource.type);
              return (
                <Card key={resource.id} className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors h-full flex flex-col">
                  {resource.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={resource.imageUrl} 
                        alt={resource.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-2 flex-grow-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge className={`
                          ${resource.type === 'article' ? 'bg-blue-500/20 text-blue-300' : ''}
                          ${resource.type === 'video' ? 'bg-red-500/20 text-red-300' : ''}
                          ${resource.type === 'tool' ? 'bg-green-500/20 text-green-300' : ''}
                          ${resource.type === 'template' ? 'bg-purple-500/20 text-purple-300' : ''}
                          ${resource.type === 'course' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                          ${resource.type === 'book' ? 'bg-indigo-500/20 text-indigo-300' : ''}
                          ${resource.type === 'podcast' ? 'bg-pink-500/20 text-pink-300' : ''}
                          ${resource.type === 'library' ? 'bg-cyan-500/20 text-cyan-300' : ''}
                        `}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </Badge>
                        {resource.isFree && (
                          <Badge className="bg-green-500/20 text-green-300">Free</Badge>
                        )}
                      </div>
                      {resource.stars && (
                        <div className="flex items-center gap-1 text-amber-300">
                          <Star className="h-4 w-4 fill-amber-300" />
                          <span className="text-sm">{resource.stars}</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl text-gray-100 mt-2">
                      {resource.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      By {resource.author} • {formatRelativeTime(resource.publishedDate)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                      {resource.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {resource.tags.slice(0, 3).map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="border-amber-500/30 text-amber-300/70 hover:border-amber-500/50 hover:text-amber-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{resource.tags.length - 3} more</span>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t border-[#2a2a3a] pt-3 mt-auto">
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-400 transition-colors mr-auto"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Resource
                    </a>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`${resource.isBookmarked ? 'text-amber-300' : 'text-gray-400 hover:text-amber-300'}`}
                        onClick={() => handleBookmark(resource.id)}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-amber-300"
                        onClick={() => handleShare(resource)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredResources.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 px-6 py-2"
              onClick={() => alert('Load more resources would be implemented here')}
            >
              Load More Resources
            </Button>
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="bg-[#1a1a2e]/50 border-t border-[#2a2a3a] py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-100 mb-8">Popular Categories</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-blue-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-blue-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">Frontend Development</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Resources for React, Vue, Angular, and modern frontend technologies.
                </p>
                <Button 
                  variant="link" 
                  className="text-amber-300 hover:text-amber-400 p-0 flex items-center"
                  onClick={() => setSelectedCategory('frontend')}
                >
                  Browse Frontend Resources
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-green-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-green-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">Backend Development</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Resources for Node.js, Python, databases, and server technologies.
                </p>
                <Button 
                  variant="link" 
                  className="text-amber-300 hover:text-amber-400 p-0 flex items-center"
                  onClick={() => setSelectedCategory('backend')}
                >
                  Browse Backend Resources
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-purple-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-purple-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">UI/UX Design</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Resources for design principles, tools, and UI/UX best practices.
                </p>
                <Button 
                  variant="link" 
                  className="text-amber-300 hover:text-amber-400 p-0 flex items-center"
                  onClick={() => setSelectedCategory('design')}
                >
                  Browse Design Resources
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-yellow-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-yellow-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">AI & Machine Learning</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Resources for AI integration, machine learning, and data science.
                </p>
                <Button 
                  variant="link" 
                  className="text-amber-300 hover:text-amber-400 p-0 flex items-center"
                  onClick={() => setSelectedCategory('ai')}
                >
                  Browse AI Resources
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Resource Types Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-8">Browse by Resource Type</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-32 border-[#2a2a3a] text-gray-300 hover:border-amber-500/50 hover:text-amber-300"
            onClick={() => setSelectedType('article')}
          >
            <FileText className="h-8 w-8 mb-3" />
            <span className="text-lg">Articles & Tutorials</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-32 border-[#2a2a3a] text-gray-300 hover:border-amber-500/50 hover:text-amber-300"
            onClick={() => setSelectedType('video')}
          >
            <Video className="h-8 w-8 mb-3" />
            <span className="text-lg">Videos & Courses</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-32 border-[#2a2a3a] text-gray-300 hover:border-amber-500/50 hover:text-amber-300"
            onClick={() => setSelectedType('tool')}
          >
            <Code className="h-8 w-8 mb-3" />
            <span className="text-lg">Tools & Libraries</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-32 border-[#2a2a3a] text-gray-300 hover:border-amber-500/50 hover:text-amber-300"
            onClick={() => setSelectedType('template')}
          >
            <Palette className="h-8 w-8 mb-3" />
            <span className="text-lg">Templates & Starters</span>
          </Button>
        </div>
      </div>

      {/* Submit Resource CTA */}
      <div className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-t border-amber-500/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Have a resource to share?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Help the community by sharing valuable resources, tools, and learning materials.
          </p>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-8 py-3 rounded-full text-lg"
            onClick={handleSubmitResource}
          >
            <Lightbulb className="h-5 w-5 mr-2" />
            Submit a Resource
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { 
  MessageSquare, 
  Users, 
  Award, 
  Lightbulb, 
  Search, 
  Plus, 
  Filter, 
  MessageCircle, 
  TrendingUp,
  Zap,
  Rocket,
  Code,
  Coffee,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import CreatePostModal from '../components/hackboard/CreatePostModal';
import CreateTeamRequestModal from '../components/hackboard/CreateTeamRequestModal';
import PostCard from '../components/hackboard/PostCard';
import TeamRequestCard from '../components/hackboard/TeamRequestCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const HackboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreateTeamRequestModalOpen, setIsCreateTeamRequestModalOpen] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper function to handle actions for unauthenticated users
  const handleAuthenticatedAction = (action: () => void, actionName: string = 'perform this action') => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: '/hackboard', 
          message: `Please log in to ${actionName}. Only authenticated users can interact with the board.` 
        } 
      });
      return;
    }
    action();
  };

  // Fetch posts and team requests
  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
      fetchTeamRequests();
      fetchPopularTags();
    }
  }, [isAuthenticated]);

  // Fetch posts with filters
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (selectedTags.length > 0) {
        params.append('tag', selectedTags[0]); // For simplicity, just use the first selected tag
      }
      
      const response = await api.get(`/hackboard/posts?${params.toString()}`);
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch team requests
  const fetchTeamRequests = async () => {
    try {
      const response = await api.get('/team/requests');
      if (response.data.success) {
        setTeamRequests(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching team requests:', err);
    }
  };

  // Fetch popular tags
  const fetchPopularTags = async () => {
    try {
      const response = await api.get('/hackboard/tags');
      setPopularTags(response.data.tags || []);
    } catch (err) {
      console.error('Error fetching popular tags:', err);
    }
  };

  // Format date to relative time (e.g., "2 hours ago")
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

  // Toggle bookmark status
  const toggleBookmark = async (postId: string) => {
    handleAuthenticatedAction(async () => {
      try {
        const response = await api.post('/hackboard/bookmark', { postId });
        
        if (response.data.success) {
          // Update local state
          setPosts(posts.map(post => 
            post.id === postId 
              ? { ...post, isBookmarked: response.data.bookmarked } 
              : post
          ));
        }
      } catch (err) {
        console.error('Error toggling bookmark:', err);
        // Fallback to local state update
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, isBookmarked: !post.isBookmarked } 
            : post
        ));
      }
    }, 'bookmark posts');
  };

  // Like a post
  const likePost = async (postId: string) => {
    handleAuthenticatedAction(async () => {
      try {
        const response = await api.post('/hackboard/like', { postId });
        
        if (response.data.success) {
          // Update local state
          setPosts(posts.map(post => 
            post.id === postId 
              ? { ...post, likes: response.data.likesCount } 
              : post
          ));
        }
      } catch (err) {
        console.error('Error liking post:', err);
        // Fallback to local state update
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes: post.likes + 1 } 
            : post
        ));
      }
    }, 'like posts');
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    handleAuthenticatedAction(() => {
      if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
      } else {
        setSelectedTags([...selectedTags, tag]);
      }
      
      // Refetch posts with the new tag filter
      fetchPosts();
    }, 'filter by tags');
  };

  // Apply filters
  useEffect(() => {
    fetchPosts();
  }, [activeCategory, searchTerm, selectedTags]);

  // Handle post creation
  const handleCreatePost = async (postData: any) => {
    try {
      const response = await api.post('/hackboard/posts', {
        title: postData.title,
        content: postData.content,
        category: postData.category,
        tags: postData.tags
      });
      
      if (response.data.success) {
        // Add the new post to the list
        setPosts([response.data.post, ...posts]);
        setIsCreatePostModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post. Please try again.');
    }
  };

  // Handle team request creation
  const handleCreateTeamRequest = async (requestData: any) => {
    try {
      const response = await api.post('/team/requests', {
        skills: requestData.skills,
        description: requestData.description
      });
      
      if (response.data.success) {
        // Add the new team request to the list
        setTeamRequests([response.data.data, ...teamRequests]);
        setIsCreateTeamRequestModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating team request:', err);
      alert('Failed to create team request. Please try again.');
    }
  };

  // Connect with team request
  const handleConnectTeamRequest = (requestId: string) => {
    handleAuthenticatedAction(() => {
      // Navigate to the team matching page
      navigate('/team', { state: { connectRequestId: requestId } });
    }, 'connect with teams');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#0a0a14] border-b border-[#2a2a3a]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/50 to-[#0a0a14]/50 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070')] bg-cover bg-center opacity-10 z-0"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-4 py-1 rounded-full text-amber-300 text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <span>Community Board for Hackathon.dev Participants</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 mb-6">
              HackBoard.dev
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with fellow hackers, share your projects, find team members, and get inspired for the world's largest hackathon.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-6 py-3 rounded-full"
                onClick={() => handleAuthenticatedAction(
                  () => setIsCreatePostModalOpen(true),
                  'create a post'
                )}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
              <Button 
                variant="outline" 
                className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 px-6 py-3 rounded-full"
                onClick={() => handleAuthenticatedAction(
                  () => navigate('/team'),
                  'find team members'
                )}
              >
                <Users className="h-4 w-4 mr-2" />
                Find Team Members
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3a]">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-300">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant={activeCategory === 'all' ? 'default' : 'ghost'} 
                  className={`w-full justify-start ${activeCategory === 'all' ? 'bg-amber-500 text-black' : 'text-gray-300 hover:text-amber-300'}`}
                  onClick={() => setActiveCategory('all')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  All Posts
                </Button>
                <Button 
                  variant={activeCategory === 'question' ? 'default' : 'ghost'} 
                  className={`w-full justify-start ${activeCategory === 'question' ? 'bg-amber-500 text-black' : 'text-gray-300 hover:text-amber-300'}`}
                  onClick={() => setActiveCategory('question')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Questions
                </Button>
                <Button 
                  variant={activeCategory === 'showcase' ? 'default' : 'ghost'} 
                  className={`w-full justify-start ${activeCategory === 'showcase' ? 'bg-amber-500 text-black' : 'text-gray-300 hover:text-amber-300'}`}
                  onClick={() => setActiveCategory('showcase')}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Showcases
                </Button>
                <Button 
                  variant={activeCategory === 'idea' ? 'default' : 'ghost'} 
                  className={`w-full justify-start ${activeCategory === 'idea' ? 'bg-amber-500 text-black' : 'text-gray-300 hover:text-amber-300'}`}
                  onClick={() => setActiveCategory('idea')}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Ideas
                </Button>
                <Button 
                  variant={activeCategory === 'team' ? 'default' : 'ghost'} 
                  className={`w-full justify-start ${activeCategory === 'team' ? 'bg-amber-500 text-black' : 'text-gray-300 hover:text-amber-300'}`}
                  onClick={() => setActiveCategory('team')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Team Requests
                </Button>
                <Button 
                  variant={activeCategory === 'resource' ? 'default' : 'ghost'} 
                  className={`w-full justify-start ${activeCategory === 'resource' ? 'bg-amber-500 text-black' : 'text-gray-300 hover:text-amber-300'}`}
                  onClick={() => setActiveCategory('resource')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Resources
                </Button>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3a]">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-300">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.length > 0 ? (
                    popularTags.slice(0, 15).map(tag => (
                      <Badge 
                        key={tag} 
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          selectedTags.includes(tag) 
                            ? 'bg-amber-500 text-black hover:bg-amber-600' 
                            : 'border-amber-500/30 text-amber-300/70 hover:border-amber-500/50 hover:text-amber-300'
                        }`}
                        onClick={() => handleTagSelect(tag)}
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No tags available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hackathon Stats */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3a]">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-300">Hackathon Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Participants</span>
                  <span className="text-amber-300 font-bold">80,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Countries</span>
                  <span className="text-amber-300 font-bold">75+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Prize Pool</span>
                  <span className="text-amber-300 font-bold">$1M+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Days Left</span>
                  <span className="text-amber-300 font-bold">25</span>
                </div>
                <Separator className="bg-[#2a2a3a]" />
                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={() => handleAuthenticatedAction(
                    () => alert('Registration successful!'),
                    'register for the hackathon'
                  )}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Register Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search posts..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1a1a2e] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50"
                />
              </div>
              <Select defaultValue="latest">
                <SelectTrigger className="w-[180px] bg-[#1a1a2e] border-[#2a2a3a] text-gray-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#2a2a3a] text-gray-200">
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="comments">Most Comments</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-[#2a2a3a] text-gray-300 hover:text-amber-300 hover:border-amber-500/50">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="bg-[#1a1a2e] border border-[#2a2a3a] p-1">
                <TabsTrigger 
                  value="posts" 
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-300"
                >
                  Community Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="teams" 
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-300"
                >
                  Team Matching
                </TabsTrigger>
              </TabsList>

              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : error ? (
                  <Card className="bg-[#1a1a2e] border-[#2a2a3a] text-center py-12">
                    <CardContent>
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-xl font-medium text-gray-300 mb-2">Error Loading Posts</h3>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <Button onClick={fetchPosts} className="bg-amber-500 hover:bg-amber-600 text-black">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : posts.length === 0 ? (
                  <Card className="bg-[#1a1a2e] border-[#2a2a3a] text-center py-12">
                    <CardContent>
                      <div className="flex flex-col items-center">
                        <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                        <h3 className="text-xl font-medium text-gray-300 mb-2">No posts found</h3>
                        <p className="text-gray-400 mb-6">
                          {searchTerm || selectedTags.length > 0 || activeCategory !== 'all'
                            ? "Try adjusting your filters or search term"
                            : "Be the first to start a conversation!"}
                        </p>
                        <Button 
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                          onClick={() => handleAuthenticatedAction(
                            () => setIsCreatePostModalOpen(true),
                            'create a post'
                          )}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {posts.map(post => (
                      <PostCard 
                        key={post.id}
                        post={post}
                        onLike={likePost}
                        onBookmark={toggleBookmark}
                        onTagClick={handleTagSelect}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Team Matching Tab */}
              <TabsContent value="teams" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading ? (
                    <div className="flex justify-center py-12 col-span-2">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : teamRequests.length === 0 ? (
                    <div className="col-span-2">
                      <Card className="bg-[#1a1a2e] border-[#2a2a3a] text-center py-12">
                        <CardContent>
                          <div className="flex flex-col items-center">
                            <Users className="h-12 w-12 text-gray-500 mb-4" />
                            <h3 className="text-xl font-medium text-gray-300 mb-2">No team requests found</h3>
                            <p className="text-gray-400 mb-6">
                              Be the first to create a team request!
                            </p>
                            <Button 
                              className="bg-amber-500 hover:bg-amber-600 text-black"
                              onClick={() => handleAuthenticatedAction(
                                () => navigate('/team'),
                                'create a team request'
                              )}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Go to Team Matching
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <>
                      {teamRequests.slice(0, 3).map(request => (
                        <TeamRequestCard 
                          key={request.id}
                          request={request}
                          onConnect={() => handleConnectTeamRequest(request.id)}
                        />
                      ))}
                      
                      {/* View More Card */}
                      <Card className="bg-[#1a1a2e] border-[#2a2a3a] border-dashed hover:border-amber-500/30 transition-colors">
                        <CardContent className="flex flex-col items-center justify-center h-full py-12">
                          <div className="bg-[#2a2a3a] p-3 rounded-full mb-4">
                            <Users className="h-6 w-6 text-amber-300" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-200 mb-2">View More Team Requests</h3>
                          <p className="text-gray-400 text-center mb-4">
                            Find the perfect collaborators for your hackathon project.
                          </p>
                          <Button 
                            className="bg-amber-500 hover:bg-amber-600 text-black"
                            onClick={() => navigate('/team')}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Go to Team Matching
                          </Button>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Trending Topics Section */}
      <div className="bg-[#1a1a2e]/50 border-t border-[#2a2a3a] py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-5 w-5 text-amber-300" />
            <h2 className="text-2xl font-bold text-gray-100">Trending Topics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-100">AI Tools for Hackathons</CardTitle>
                <CardDescription className="text-gray-400">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span>128 posts this week</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Discover how AI tools like ChatGPT, Midjourney, and Claude can supercharge your hackathon project development.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[#2a2a3a] text-gray-200">AI</Badge>
                  <Badge className="bg-[#2a2a3a] text-gray-200">Tools</Badge>
                  <Badge className="bg-[#2a2a3a] text-gray-200">Productivity</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-100">Finding Remote Team Members</CardTitle>
                <CardDescription className="text-gray-400">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span>94 posts this week</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Strategies for building effective remote teams and collaborating across time zones during the hackathon.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[#2a2a3a] text-gray-200">Teams</Badge>
                  <Badge className="bg-[#2a2a3a] text-gray-200">Remote</Badge>
                  <Badge className="bg-[#2a2a3a] text-gray-200">Collaboration</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-100">Winning Hackathon Strategies</CardTitle>
                <CardDescription className="text-gray-400">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span>76 posts this week</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Tips from previous winners on how to stand out, impress judges, and maximize your chances of winning.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[#2a2a3a] text-gray-200">Strategy</Badge>
                  <Badge className="bg-[#2a2a3a] text-gray-200">Winning</Badge>
                  <Badge className="bg-[#2a2a3a] text-gray-200">Presentation</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Zap className="h-5 w-5 text-amber-300" />
          <h2 className="text-2xl font-bold text-gray-100">Hackathon Resources</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
            <CardContent className="pt-6">
              <div className="bg-[#2a2a3a] p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-100 mb-2">Starter Templates</h3>
              <p className="text-gray-400 mb-4">
                Ready-to-use project templates to jumpstart your hackathon project development.
              </p>
              <Button 
                variant="link" 
                className="text-amber-300 hover:text-amber-400 p-0"
                onClick={() => handleAuthenticatedAction(
                  () => navigate('/resources'),
                  'access templates'
                )}
              >
                Browse Templates →
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
            <CardContent className="pt-6">
              <div className="bg-[#2a2a3a] p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-100 mb-2">Builder Pack</h3>
              <p className="text-gray-400 mb-4">
                Access the official hackathon.dev Builder Pack with premium tools and credits.
              </p>
              <Button 
                variant="link" 
                className="text-amber-300 hover:text-amber-400 p-0"
                onClick={() => handleAuthenticatedAction(
                  () => navigate('/resources'),
                  'access the Builder Pack'
                )}
              >
                Get Builder Pack →
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
            <CardContent className="pt-6">
              <div className="bg-[#2a2a3a] p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-100 mb-2">Project Ideas</h3>
              <p className="text-gray-400 mb-4">
                Explore curated project ideas and inspiration for your hackathon submission.
              </p>
              <Button 
                variant="link" 
                className="text-amber-300 hover:text-amber-400 p-0"
                onClick={() => handleAuthenticatedAction(
                  () => navigate('/resources'),
                  'browse project ideas'
                )}
              >
                Browse Ideas →
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
            <CardContent className="pt-6">
              <div className="bg-[#2a2a3a] p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Coffee className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-100 mb-2">Virtual Coffee Chats</h3>
              <p className="text-gray-400 mb-4">
                Connect with other participants for virtual coffee chats and networking.
              </p>
              <Button 
                variant="link" 
                className="text-amber-300 hover:text-amber-400 p-0"
                onClick={() => handleAuthenticatedAction(
                  () => navigate('/team'),
                  'schedule coffee chats'
                )}
              >
                Schedule a Chat →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-t border-amber-500/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Ready to join the world's largest hackathon?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Register now to compete for over $1M in prizes and set a Guinness World Record!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-8 py-3 rounded-full text-lg"
              onClick={() => handleAuthenticatedAction(
                () => alert('Registration successful!'),
                'register for the hackathon'
              )}
            >
              Register Now
            </Button>
            <Button 
              variant="outline" 
              className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 px-8 py-3 rounded-full text-lg"
              onClick={() => handleAuthenticatedAction(
                () => window.open('https://discord.gg/hackathon', '_blank'),
                'join Discord'
              )}
            >
              Join Discord
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatePostModal 
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      <CreateTeamRequestModal
        isOpen={isCreateTeamRequestModalOpen}
        onClose={() => setIsCreateTeamRequestModalOpen(false)}
        onSubmit={handleCreateTeamRequest}
      />
    </div>
  );
};

export default HackboardPage;
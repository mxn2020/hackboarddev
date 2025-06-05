import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  MessageSquare, 
  Users, 
  Award, 
  Lightbulb, 
  Search, 
  Plus, 
  Filter, 
  ThumbsUp, 
  MessageCircle, 
  Clock, 
  Tag, 
  Bookmark, 
  Share2, 
  TrendingUp,
  Zap,
  Rocket,
  Code,
  Coffee,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import CreatePostModal from '../components/hackboard/CreatePostModal';
import CreateTeamRequestModal from '../components/hackboard/CreateTeamRequestModal';
import PostCard from '../components/hackboard/PostCard';
import TeamRequestCard from '../components/hackboard/TeamRequestCard';

// Types for our community board
interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: 'question' | 'showcase' | 'idea' | 'team' | 'resource';
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  isBookmarked?: boolean;
}

interface TeamRequest {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  skills: string[];
  description: string;
  createdAt: string;
}

// Mock data for posts
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Looking for a designer for my AI-powered education platform',
    content: 'I\'m building an AI tool that helps students learn programming concepts through interactive exercises. Need someone with UI/UX skills to make it look amazing!',
    author: {
      id: 'user1',
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    category: 'team',
    tags: ['ai', 'education', 'design'],
    likes: 24,
    comments: 8,
    createdAt: '2025-06-04T15:32:00Z',
    isBookmarked: true
  },
  {
    id: '2',
    title: 'Just launched my hackathon project - Feedback welcome!',
    content: 'After 3 weeks of coding, I\'ve finally launched my project: a tool that helps remote teams build better connections through async video messages. Would love your feedback!',
    author: {
      id: 'user2',
      name: 'Sophia Williams',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    category: 'showcase',
    tags: ['remote-work', 'video', 'launched'],
    likes: 56,
    comments: 17,
    createdAt: '2025-06-05T09:15:00Z'
  },
  {
    id: '3',
    title: 'How are you handling authentication in your projects?',
    content: 'I\'m trying to decide between using Auth0, Clerk, or rolling my own auth system with JWT. What are you all using for your hackathon projects?',
    author: {
      id: 'user3',
      name: 'Marcus Johnson',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    category: 'question',
    tags: ['authentication', 'security', 'development'],
    likes: 18,
    comments: 32,
    createdAt: '2025-06-03T21:45:00Z'
  },
  {
    id: '4',
    title: 'Idea: AI-powered personal finance coach for Gen Z',
    content: 'What if we built an AI financial coach specifically designed for Gen Z? It could help with budgeting, investing, and financial literacy in a way that\'s engaging and not boring.',
    author: {
      id: 'user4',
      name: 'Priya Patel',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    category: 'idea',
    tags: ['fintech', 'ai', 'gen-z'],
    likes: 42,
    comments: 12,
    createdAt: '2025-06-02T14:20:00Z'
  },
  {
    id: '5',
    title: 'Free resource: 50+ APIs you can use in your hackathon project',
    content: 'I\'ve compiled a list of 50+ free APIs that you can integrate into your hackathon projects. Everything from weather data to AI image generation.',
    author: {
      id: 'user5',
      name: 'David Kim',
      avatar: 'https://i.pravatar.cc/150?img=7'
    },
    category: 'resource',
    tags: ['api', 'resources', 'free'],
    likes: 87,
    comments: 14,
    createdAt: '2025-06-01T11:10:00Z'
  },
  {
    id: '6',
    title: 'How do I deploy my Next.js app to Vercel?',
    content: 'I\'m having trouble deploying my Next.js application to Vercel. I keep getting build errors related to environment variables. Has anyone else run into this?',
    author: {
      id: 'user6',
      name: 'Emma Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=9'
    },
    category: 'question',
    tags: ['nextjs', 'vercel', 'deployment'],
    likes: 12,
    comments: 23,
    createdAt: '2025-06-04T18:30:00Z'
  }
];

// Mock data for team requests
const MOCK_TEAM_REQUESTS: TeamRequest[] = [
  {
    id: '1',
    author: {
      id: 'user1',
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    skills: ['UI/UX Designer', 'Frontend Developer'],
    description: 'Looking for a backend developer and ML engineer to join my team. We\'re building an AI-powered education platform.',
    createdAt: '2025-06-04T15:32:00Z'
  },
  {
    id: '2',
    author: {
      id: 'user7',
      name: 'Jamal Wilson',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    skills: ['Backend Developer', 'DevOps'],
    description: 'Seeking a designer and frontend developer for a fintech app targeting small businesses.',
    createdAt: '2025-06-03T12:15:00Z'
  },
  {
    id: '3',
    author: {
      id: 'user8',
      name: 'Olivia Martinez',
      avatar: 'https://i.pravatar.cc/150?img=11'
    },
    skills: ['Product Manager', 'UX Researcher'],
    description: 'Looking for developers to help build a sustainability tracking app. Great idea with market potential!',
    createdAt: '2025-06-02T09:45:00Z'
  }
];

// Popular tags for the community
const POPULAR_TAGS = [
  'ai', 'web3', 'design', 'mobile', 'api', 
  'frontend', 'backend', 'database', 'cloud', 
  'react', 'nextjs', 'typescript', 'python', 
  'machine-learning', 'blockchain', 'fintech', 
  'saas', 'productivity', 'education', 'health'
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>(MOCK_TEAM_REQUESTS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showTeamRequestModal, setShowTeamRequestModal] = useState(false);

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

  // Filter posts based on active category, search term, and selected tags
  const filteredPosts = posts.filter(post => {
    // Filter by category
    if (activeCategory !== 'all' && post.category !== activeCategory) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !post.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0 && !selectedTags.some(tag => post.tags.includes(tag))) {
      return false;
    }
    
    return true;
  });

  // Toggle bookmark status
  const toggleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked } 
        : post
    ));
  };

  // Like a post
  const likePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 } 
        : post
    ));
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Handle post creation
  const handleCreatePost = (postData: any) => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      title: postData.title,
      content: postData.content,
      author: {
        id: user?.id || 'guest',
        name: user?.name || 'Guest User',
        avatar: undefined
      },
      category: postData.category,
      tags: postData.tags,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      isBookmarked: false
    };
    
    setPosts([newPost, ...posts]);
    setShowCreatePostModal(false);
  };

  // Handle team request creation
  const handleCreateTeamRequest = (requestData: any) => {
    const newRequest: TeamRequest = {
      id: `request_${Date.now()}`,
      author: {
        id: user?.id || 'guest',
        name: user?.name || 'Guest User',
        avatar: undefined
      },
      skills: requestData.skills,
      description: requestData.description,
      createdAt: new Date().toISOString()
    };
    
    setTeamRequests([newRequest, ...teamRequests]);
    setShowTeamRequestModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#0a0a14] border-b border-[#2a2a3a]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/50 to-[#0a0a14]/50 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10 z-0"></div>
        
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
                onClick={() => setShowCreatePostModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
              <Button 
                variant="outline" 
                className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 px-6 py-3 rounded-full"
                onClick={() => setShowTeamRequestModal(true)}
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
                  {POPULAR_TAGS.slice(0, 15).map(tag => (
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
                  ))}
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
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black">
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
                {filteredPosts.length === 0 ? (
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
                          onClick={() => setShowCreatePostModal(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts.map(post => (
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
                  {teamRequests.map(request => (
                    <TeamRequestCard 
                      key={request.id} 
                      request={request} 
                      onConnect={() => alert(`Connecting with ${request.author.name}`)}
                    />
                  ))}

                  {/* Create Team Request Card */}
                  <Card className="bg-[#1a1a2e] border-[#2a2a3a] border-dashed hover:border-amber-500/30 transition-colors">
                    <CardContent className="flex flex-col items-center justify-center h-full py-12">
                      <div className="bg-[#2a2a3a] p-3 rounded-full mb-4">
                        <Users className="h-6 w-6 text-amber-300" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-200 mb-2">Looking for team members?</h3>
                      <p className="text-gray-400 text-center mb-4">
                        Create a team request to find the perfect collaborators for your hackathon project.
                      </p>
                      <Button 
                        className="bg-amber-500 hover:bg-amber-600 text-black"
                        onClick={() => setShowTeamRequestModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Team Request
                      </Button>
                    </CardContent>
                  </Card>
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
              <Button variant="link" className="text-amber-300 hover:text-amber-400 p-0 group">
                Browse Templates <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
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
              <Button variant="link" className="text-amber-300 hover:text-amber-400 p-0 group">
                Get Builder Pack <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
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
              <Button variant="link" className="text-amber-300 hover:text-amber-400 p-0 group">
                Browse Ideas <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
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
              <Button variant="link" className="text-amber-300 hover:text-amber-400 p-0 group">
                Schedule a Chat <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
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
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-8 py-3 rounded-full text-lg">
              Register Now
            </Button>
            <Button variant="outline" className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 px-8 py-3 rounded-full text-lg">
              Join Discord
            </Button>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={showCreatePostModal} 
        onClose={() => setShowCreatePostModal(false)} 
        onSubmit={handleCreatePost}
      />

      {/* Create Team Request Modal */}
      <CreateTeamRequestModal
        isOpen={showTeamRequestModal}
        onClose={() => setShowTeamRequestModal(false)}
        onSubmit={handleCreateTeamRequest}
      />
    </div>
  );
};

export default HomePage;
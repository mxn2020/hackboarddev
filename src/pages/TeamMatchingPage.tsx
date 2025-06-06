import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MessageSquare, 
  Briefcase, 
  Code,
  Zap,
  Award,
  AlertCircle,
  RefreshCw,
  Send,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import CreateTeamRequestModal from '../components/hackboard/CreateTeamRequestModal';
import TeamRequestCard from '../components/hackboard/TeamRequestCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Types
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

interface TeamConnection {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const TeamMatchingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);
  const [myRequests, setMyRequests] = useState<TeamRequest[]>([]);
  const [connections, setConnections] = useState<TeamConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [isCreateTeamRequestModalOpen, setIsCreateTeamRequestModalOpen] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TeamRequest | null>(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [isSendingConnection, setIsSendingConnection] = useState(false);

  // Fetch team requests and connections
  useEffect(() => {
    if (isAuthenticated) {
      fetchTeamRequests();
      fetchMyRequests();
      fetchConnections();
    }
  }, [isAuthenticated]);

  // Fetch all team requests
  const fetchTeamRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/team/requests');
      
      if (response.data.success) {
        setTeamRequests(response.data.data || []);
      } else {
        setError(response.data.error || 'Failed to load team requests');
      }
    } catch (err) {
      console.error('Error fetching team requests:', err);
      setError('Failed to load team requests. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch my team requests
  const fetchMyRequests = async () => {
    try {
      const response = await api.get('/team/my-requests');
      
      if (response.data.success) {
        setMyRequests(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching my team requests:', err);
    }
  };

  // Fetch my connections
  const fetchConnections = async () => {
    try {
      setIsLoadingConnections(true);
      
      const response = await api.get('/team/connections');
      
      if (response.data.success) {
        setConnections(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  // Filter team requests based on search and skill filter
  const filteredRequests = teamRequests.filter(request => {
    // Filter out user's own requests
    if (user && request.author.id === user.id) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const descriptionMatch = request.description.toLowerCase().includes(term);
      const skillsMatch = request.skills.some(skill => skill.toLowerCase().includes(term));
      const authorMatch = request.author.name.toLowerCase().includes(term);
      
      if (!descriptionMatch && !skillsMatch && !authorMatch) {
        return false;
      }
    }
    
    // Apply skill filter
    if (selectedSkill !== 'all') {
      return request.skills.some(skill => 
        skill.toLowerCase() === selectedSkill.toLowerCase()
      );
    }
    
    return true;
  });

  // Get all unique skills from team requests
  const allSkills = Array.from(new Set(
    teamRequests.flatMap(request => request.skills)
  )).sort();

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
        setMyRequests([response.data.data, ...myRequests]);
        setIsCreateTeamRequestModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating team request:', err);
      alert('Failed to create team request. Please try again.');
    }
  };

  // Handle connect with team request
  const handleConnectTeamRequest = (request: TeamRequest) => {
    if (!isAuthenticated) {
      alert('Please log in to connect with team members');
      return;
    }
    
    setSelectedRequest(request);
    setConnectMessage(`Hi ${request.author.name}, I'm interested in joining your team! I have experience with ${user?.preferences?.skills || 'web development'}.`);
    setConnectDialogOpen(true);
  };

  // Send connection request
  const sendConnectionRequest = async () => {
    if (!selectedRequest || !connectMessage.trim()) {
      return;
    }
    
    setIsSendingConnection(true);
    
    try {
      const response = await api.post('/team/connect', {
        requestId: selectedRequest.id,
        message: connectMessage
      });
      
      if (response.data.success) {
        // Add the new connection to the list
        setConnections([response.data.data, ...connections]);
        setConnectDialogOpen(false);
        setConnectMessage('');
        setSelectedRequest(null);
        
        // Show success message
        alert('Connection request sent successfully!');
      }
    } catch (err) {
      console.error('Error sending connection request:', err);
      alert('Failed to send connection request. Please try again.');
    } finally {
      setIsSendingConnection(false);
    }
  };

  // Handle connection response (accept/reject)
  const handleConnectionResponse = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await api.put(`/team/connections/${connectionId}`, { status });
      
      if (response.data.success) {
        // Update the connection in the list
        setConnections(connections.map(conn => 
          conn.id === connectionId ? { ...conn, status } : conn
        ));
      }
    } catch (err) {
      console.error('Error responding to connection request:', err);
      alert('Failed to respond to connection request. Please try again.');
    }
  };

  // Delete a team request
  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this team request?')) {
      return;
    }
    
    try {
      const response = await api.delete(`/team/requests/${requestId}`);
      
      if (response.data.success) {
        // Remove the request from both lists
        setTeamRequests(teamRequests.filter(req => req.id !== requestId));
        setMyRequests(myRequests.filter(req => req.id !== requestId));
      }
    } catch (err) {
      console.error('Error deleting team request:', err);
      alert('Failed to delete team request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#0a0a14] border-b border-[#2a2a3a]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/50 to-[#0a0a14]/50 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-10 z-0"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-4 py-1 rounded-full text-amber-300 text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              <span>Find Your Dream Team</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 mb-6">
              Team Matching
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with talented developers, designers, and creators to form the perfect team for your hackathon project.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-6 py-3 rounded-full"
                onClick={() => setIsCreateTeamRequestModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Team Request
              </Button>
              <Button 
                variant="outline" 
                className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 px-6 py-3 rounded-full"
                onClick={() => window.location.href = '#my-connections'}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                View My Connections
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="find-team" className="w-full">
          <TabsList className="bg-[#1a1a2e] border border-[#2a2a3a] p-1 mb-8">
            <TabsTrigger 
              value="find-team" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-300"
            >
              Find Team Members
            </TabsTrigger>
            <TabsTrigger 
              value="my-requests" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-300"
            >
              My Team Requests
            </TabsTrigger>
            <TabsTrigger 
              value="my-connections" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-300"
              id="my-connections"
            >
              My Connections
            </TabsTrigger>
          </TabsList>

          {/* Find Team Members Tab */}
          <TabsContent value="find-team">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search by skills, description, or name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1a1a2e] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50"
                />
              </div>
              
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="w-[180px] bg-[#1a1a2e] border-[#2a2a3a] text-gray-200">
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#2a2a3a] text-gray-200">
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-red-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-red-400 mb-2">Error Loading Team Requests</h3>
                    <p className="text-gray-300">{error}</p>
                    <Button 
                      onClick={fetchTeamRequests} 
                      variant="outline" 
                      className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Team Requests Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No team requests found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || selectedSkill !== 'all'
                    ? "Try adjusting your filters or search term"
                    : "Be the first to create a team request!"}
                </p>
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={() => setIsCreateTeamRequestModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team Request
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map(request => (
                  <TeamRequestCard 
                    key={request.id}
                    request={request}
                    onConnect={() => handleConnectTeamRequest(request)}
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
                      onClick={() => setIsCreateTeamRequestModalOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Team Request
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* My Team Requests Tab */}
          <TabsContent value="my-requests">
            {!isAuthenticated ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">Authentication Required</h3>
                <p className="text-gray-400 mb-6">
                  Please log in to view and manage your team requests.
                </p>
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={() => window.location.href = '/login'}
                >
                  Log In
                </Button>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No team requests yet</h3>
                <p className="text-gray-400 mb-6">
                  You haven't created any team requests yet. Create one to find team members!
                </p>
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={() => setIsCreateTeamRequestModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team Request
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">My Team Requests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myRequests.map(request => (
                    <Card key={request.id} className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="bg-amber-500 text-black w-10 h-10 rounded-full flex items-center justify-center font-bold">
                              {request.author.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-200">{request.author.name}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                Posted {formatRelativeTime(request.createdAt)}
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">
                            My Request
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-400 mb-1">Skills I Bring:</div>
                          <div className="flex flex-wrap gap-2">
                            {request.skills.map(skill => (
                              <Badge key={skill} className="bg-[#2a2a3a] text-gray-200">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-400 mb-1">Looking For:</div>
                          <p className="text-gray-300">{request.description}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-[#2a2a3a] pt-3">
                        <Button 
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 mr-auto"
                          onClick={() => handleDeleteRequest(request.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Delete Request
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* My Connections Tab */}
          <TabsContent value="my-connections">
            {!isAuthenticated ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">Authentication Required</h3>
                <p className="text-gray-400 mb-6">
                  Please log in to view and manage your connections.
                </p>
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={() => window.location.href = '/login'}
                >
                  Log In
                </Button>
              </div>
            ) : isLoadingConnections ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No connections yet</h3>
                <p className="text-gray-400 mb-6">
                  You haven't connected with any team members yet. Browse team requests to find potential collaborators!
                </p>
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={() => document.querySelector('[value="find-team"]')?.dispatchEvent(new Event('click'))}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Find Team Members
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Incoming Requests */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">Incoming Connection Requests</h2>
                  <div className="space-y-4">
                    {connections.filter(conn => 
                      conn.recipientId === user?.id && conn.status === 'pending'
                    ).length === 0 ? (
                      <p className="text-gray-400">No pending connection requests.</p>
                    ) : (
                      connections
                        .filter(conn => conn.recipientId === user?.id && conn.status === 'pending')
                        .map(connection => (
                          <Card key={connection.id} className="bg-[#1a1a2e] border-[#2a2a3a]">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-500/20 text-blue-300 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                    {connection.senderName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-200">{connection.senderName}</div>
                                    <div className="text-xs text-gray-400">
                                      Sent {formatRelativeTime(connection.createdAt)}
                                    </div>
                                  </div>
                                </div>
                                <Badge className="bg-blue-500/20 text-blue-300">
                                  Incoming Request
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-[#2a2a3a] p-4 rounded-lg mb-4">
                                <p className="text-gray-300 italic">"{connection.message}"</p>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t border-[#2a2a3a] pt-3 flex justify-end gap-3">
                              <Button 
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                onClick={() => handleConnectionResponse(connection.id, 'rejected')}
                              >
                                Decline
                              </Button>
                              <Button 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleConnectionResponse(connection.id, 'accepted')}
                              >
                                Accept
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                    )}
                  </div>
                </div>

                {/* Outgoing Requests */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">Outgoing Connection Requests</h2>
                  <div className="space-y-4">
                    {connections.filter(conn => 
                      conn.senderId === user?.id && conn.status === 'pending'
                    ).length === 0 ? (
                      <p className="text-gray-400">No outgoing connection requests.</p>
                    ) : (
                      connections
                        .filter(conn => conn.senderId === user?.id && conn.status === 'pending')
                        .map(connection => (
                          <Card key={connection.id} className="bg-[#1a1a2e] border-[#2a2a3a]">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className="bg-amber-500/20 text-amber-300 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                    {connection.recipientName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-200">{connection.recipientName}</div>
                                    <div className="text-xs text-gray-400">
                                      Sent {formatRelativeTime(connection.createdAt)}
                                    </div>
                                  </div>
                                </div>
                                <Badge className="bg-amber-500/20 text-amber-300">
                                  Pending
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-[#2a2a3a] p-4 rounded-lg mb-4">
                                <p className="text-gray-300 italic">"{connection.message}"</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </div>
                </div>

                {/* Accepted Connections */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">Active Connections</h2>
                  <div className="space-y-4">
                    {connections.filter(conn => 
                      (conn.senderId === user?.id || conn.recipientId === user?.id) && 
                      conn.status === 'accepted'
                    ).length === 0 ? (
                      <p className="text-gray-400">No active connections yet.</p>
                    ) : (
                      connections
                        .filter(conn => 
                          (conn.senderId === user?.id || conn.recipientId === user?.id) && 
                          conn.status === 'accepted'
                        )
                        .map(connection => {
                          // Determine if user is sender or recipient
                          const isSender = connection.senderId === user?.id;
                          const otherPersonName = isSender ? connection.recipientName : connection.senderName;
                          const otherPersonAvatar = isSender ? connection.recipientAvatar : connection.senderAvatar;
                          
                          return (
                            <Card key={connection.id} className="bg-[#1a1a2e] border-[#2a2a3a]">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-green-500/20 text-green-300 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                      {otherPersonName.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-200">{otherPersonName}</div>
                                      <div className="text-xs text-gray-400">
                                        Connected {formatRelativeTime(connection.updatedAt)}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge className="bg-green-500/20 text-green-300">
                                    Connected
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardFooter className="border-t border-[#2a2a3a] pt-3">
                                <Button 
                                  className="bg-amber-500 hover:bg-amber-600 text-black w-full"
                                  onClick={() => alert(`Contact ${otherPersonName} at their email`)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Skills Section */}
      <div className="bg-[#1a1a2e]/50 border-t border-[#2a2a3a] py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-100 mb-8">Popular Skills</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-blue-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-blue-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">Frontend Development</h3>
                <p className="text-gray-400 text-sm mb-4">
                  React, Vue, Angular, and modern frontend frameworks.
                </p>
                <Button 
                  variant="link" 
                  className="text-amber-300 hover:text-amber-400 p-0"
                  onClick={() => setSelectedSkill('React')}
                >
                  Find React Developers →
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-green-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-green-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">Backend Development</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Node.js, Python, Java, and server technologies.
                </p>
                <Button 
                  variant="link" 
                  className="text-amber-300 hover:text-amber-400 p-0"
                  onClick={() => setSelectedSkill('Node.js')}
                >
                  Find Backend Developers →
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-purple-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-purple-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">UI/UX Design</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Figma, Adobe XD, and design principles.
                </p>
                <Button 
                  variant="link" 
                  className="text-amber-300 hover:text-amber-400 p-0"
                  onClick={() => setSelectedSkill('UI/UX')}
                >
                  Find UI/UX Designers →
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-yellow-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-yellow-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">AI & Machine Learning</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Python, TensorFlow, PyTorch, and AI integration.
                </p>
                <Button 
                  variant="link" 
                  className="text-amber-300 hover:text-amber-400 p-0"
                  onClick={() => setSelectedSkill('Machine Learning')}
                >
                  Find AI Specialists →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-t border-amber-500/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Ready to find your dream team?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Create a team request or browse existing ones to connect with talented developers for your hackathon project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-8 py-3 rounded-full text-lg"
              onClick={() => setIsCreateTeamRequestModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Team Request
            </Button>
            <Button 
              variant="outline" 
              className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 px-8 py-3 rounded-full text-lg"
              onClick={() => document.querySelector('[value="find-team"]')?.dispatchEvent(new Event('click'))}
            >
              <Users className="h-5 w-5 mr-2" />
              Browse Requests
            </Button>
          </div>
        </div>
      </div>

      {/* Create Team Request Modal */}
      <CreateTeamRequestModal 
        isOpen={isCreateTeamRequestModalOpen}
        onClose={() => setIsCreateTeamRequestModalOpen(false)}
        onSubmit={handleCreateTeamRequest}
      />

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-[#2a2a3a] text-gray-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-amber-300">Connect with {selectedRequest?.author.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Send a message to introduce yourself and express your interest in joining their team.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="bg-[#2a2a3a] p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-400 mb-1">They're looking for:</div>
                <p className="text-gray-300">{selectedRequest.description}</p>
              </div>
              
              <div>
                <Label htmlFor="message" className="text-gray-300 mb-2 block">Your Message</Label>
                <Textarea 
                  id="message"
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you'd be a good fit for their team..."
                  className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50 min-h-32"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConnectDialogOpen(false)}
              className="border-[#2a2a3a] text-gray-300 hover:text-amber-300 hover:border-amber-500/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={sendConnectionRequest}
              disabled={isSendingConnection || !connectMessage.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isSendingConnection ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamMatchingPage;
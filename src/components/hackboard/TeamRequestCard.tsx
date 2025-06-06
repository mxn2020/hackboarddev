import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Clock, Triangle } from 'lucide-react';

export interface TeamRequest {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  skills: string[];
  description: string;
  createdAt: string;
  upvotes?: number;
  isUpvoted?: boolean;
}

interface TeamRequestCardProps {
  request: TeamRequest;
  onConnect: (id: string) => void;
  onUpvote?: (id: string) => void;
}

const TeamRequestCard: React.FC<TeamRequestCardProps> = ({ request, onConnect, onUpvote }) => {
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

  return (
    <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors flex">
      <div className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={request.author.avatar} />
                <AvatarFallback className="bg-amber-500 text-black">
                  {request.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-gray-200">{request.author.name}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(request.createdAt)}
                </div>
              </div>
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">
              Team Request
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
            className="w-full bg-amber-500 hover:bg-amber-600 text-black"
            onClick={() => onConnect(request.id)}
          >
            Connect
          </Button>
        </CardFooter>
      </div>
      {/* Upvote section */}
      <div className="flex flex-col items-center justify-center px-4 min-w-[64px] border-l border-[#2a2a3a] bg-[#181825]">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full text-2xl ${request.isUpvoted ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`}
          onClick={() => onUpvote && onUpvote(request.id)}
          aria-label="Upvote"
        >
          <Triangle className="h-7 w-7 rotate-0" />
        </Button>
        <span className="text-lg font-bold text-amber-400 mt-1">{request.upvotes || 0}</span>
      </div>
    </Card>
  );
};

export default TeamRequestCard;
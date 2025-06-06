import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
}

const LoginPromptDialog: React.FC<LoginPromptDialogProps> = ({
  open,
  onOpenChange,
  action,
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onOpenChange(false);
    navigate('/login', {
      state: {
        from: '/hackboard',
        message: `Please log in to ${action}. Only authenticated users can interact with the board.`,
      },
    });
  };

  const handleRegister = () => {
    onOpenChange(false);
    navigate('/register', {
      state: {
        from: '/hackboard',
        message: `Create an account to ${action} and join the community.`,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-[#2a2a3a]">
        <DialogHeader>
          <DialogTitle className="text-amber-300">Authentication Required</DialogTitle>
          <DialogDescription className="text-gray-300">
            You need to be logged in to {action}. Please log in or create an account to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleLogin}
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Log In
          </Button>
          <Button
            onClick={handleRegister}
            variant="outline"
            className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPromptDialog;

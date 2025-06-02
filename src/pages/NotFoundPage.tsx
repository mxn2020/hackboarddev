import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto">
        {/* 404 Illustration */}
        <div className="text-9xl font-bold text-gray-300 dark:text-gray-700 mb-4">
          404
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Page Not Found</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>
        
        <div className="pt-6 flex flex-wrap gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
          
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home Page
            </Link>
          </Button>
        </div>
        
        {/* Extra suggestions */}
        <div className="mt-10 pt-10 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <p className="mb-4 font-medium">You might want to check:</p>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="underline hover:text-primary">Homepage</Link>
              </li>
              <li>
                <Link to="/blog" className="underline hover:text-primary">Blog</Link>
              </li>
              <li>
                <Link to="/examples" className="underline hover:text-primary">Examples</Link>
              </li>
              {/* Add links to other key sections */}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto">
        {/* 404 Illustration */}
        <div className="text-9xl font-bold text-gray-300 dark:text-gray-700 mb-4">
          404
        </div>
        
        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-6">
          <Link to="/dashboard">
            <Button className="inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link 
              to="/notes" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              My Notes
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              to="/blog" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Blog
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              to="/examples" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Examples
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

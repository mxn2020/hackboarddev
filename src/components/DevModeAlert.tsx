import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { InfoIcon } from 'lucide-react';

export const DevModeAlert: React.FC = () => {
  const isDevelopmentMode = import.meta.env.DEV || window.location.hostname.includes('stackblitz');

  if (!isDevelopmentMode) {
    return null;
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-800">
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>
        <strong>Development Mode:</strong> You're running in development mode with simulated authentication.
        Data is stored locally and will be lost when you refresh.
        Try registering with any email/password combination!
      </AlertDescription>
    </Alert>
  );
};

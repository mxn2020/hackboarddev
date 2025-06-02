import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

type Status = 'success' | 'error' | 'warning' | 'info';

interface TestResultPanelProps {
  status: Status;
  title: string;
  message: string;
  details?: Record<string, any>;
  className?: string;
}

const TestResultPanel: React.FC<TestResultPanelProps> = ({
  status,
  title,
  message,
  details,
  className,
}) => {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 border-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 border-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50 border-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 border-blue-100',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
  };

  const { icon: StatusIcon, bgColor, textColor, iconColor } = statusConfig[status];

  return (
    <div className={cn(`p-4 rounded-md border ${bgColor}`, className)}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <StatusIcon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${textColor}`}>
            {title}
          </h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>{message}</p>
            {details && Object.entries(details).length > 0 && (
              <div className="mt-3 border-t border-gray-200 pt-3">
                {Object.entries(details).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-2 mb-1">
                    <span className="text-xs font-medium">{key}:</span>
                    <span className="text-xs col-span-2 break-words">
                      {typeof value === 'object' 
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultPanel;

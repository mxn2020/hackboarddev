import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, className = '' }) => {
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8
    },
    {
      label: 'Contains uppercase letter',
      test: (pwd) => /[A-Z]/.test(pwd)
    },
    {
      label: 'Contains lowercase letter',
      test: (pwd) => /[a-z]/.test(pwd)
    },
    {
      label: 'Contains number',
      test: (pwd) => /\d/.test(pwd)
    },
    {
      label: 'Contains special character',
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ];

  const metRequirements = requirements.filter(req => req.test(password));
  const strength = metRequirements.length;

  const getStrengthColor = () => {
    if (strength <= 2) return 'text-red-500';
    if (strength <= 3) return 'text-yellow-500';
    if (strength <= 4) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStrengthText = () => {
    if (strength === 0) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Password Strength</span>
        <span className={`text-sm font-medium ${getStrengthColor()}`}>
          {getStrengthText()}
        </span>
      </div>

      {/* Strength bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${strength <= 2 ? 'bg-red-500' :
              strength <= 3 ? 'bg-yellow-500' :
                strength <= 4 ? 'bg-orange-500' :
                  'bg-green-500'
            }`}
          style={{ width: `${(strength / requirements.length) * 100}%` }}
        />
      </div>

      {/* Requirements list */}
      <div className="space-y-1">
        {requirements.map((requirement, index) => {
          const met = requirement.test(password);
          return (
            <div key={index} className="flex items-center space-x-2 text-xs">
              {met ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-gray-400" />
              )}
              <span className={met ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                {requirement.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrength;

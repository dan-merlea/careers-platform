import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LightBulbIcon,
  ArrowRightIcon,
  ClipboardDocumentCheckIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import Card from '../common/Card';

interface Suggestion {
  id: string;
  type: 'interview_process' | 'company_details' | 'department_assignment' | 'calendar_integration';
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
}

interface SuggestionsWidgetProps {
  suggestions: Suggestion[];
}

const SuggestionsWidget: React.FC<SuggestionsWidgetProps> = ({ suggestions }) => {

  // Don't render if no suggestions
  if (suggestions.length === 0) {
    return null;
  }

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'interview_process':
        return <ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-500" />;
      case 'company_details':
        return <BuildingOfficeIcon className="h-6 w-6 text-purple-500" />;
      case 'department_assignment':
        return <UserGroupIcon className="h-6 w-6 text-green-500" />;
      case 'calendar_integration':
        return <CalendarDaysIcon className="h-6 w-6 text-indigo-500" />;
      default:
        return <LightBulbIcon className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'interview_process':
        return 'bg-blue-50';
      case 'company_details':
        return 'bg-purple-50';
      case 'department_assignment':
        return 'bg-green-50';
      case 'calendar_integration':
        return 'bg-indigo-50';
      default:
        return 'bg-yellow-50';
    }
  };

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <div className="flex items-center gap-2 mb-4">
        <LightBulbIcon className="h-6 w-6 text-yellow-500" />
        <h2 className="text-lg font-semibold text-gray-800">Suggestions</h2>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`p-4 ${getBackgroundColor(suggestion.type)} border border-gray-200 rounded-lg`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIconComponent(suggestion.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {suggestion.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {suggestion.description}
                </p>
                <Link
                  to={suggestion.actionLink}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {suggestion.actionText}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SuggestionsWidget;

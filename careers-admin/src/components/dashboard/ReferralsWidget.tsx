import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlusIcon,
  ArrowRightIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import Card from '../common/Card';

interface Referral {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobId: string;
  jobTitle: string;
  status: string;
  progress: number;
  createdAt: string;
  stages: Array<{
    id: string;
    title: string;
    order: number;
    color: string;
  }>;
}

interface ReferralsWidgetProps {
  referrals: Referral[];
}

const ReferralsWidget: React.FC<ReferralsWidgetProps> = ({ referrals }) => {
  // Don't render if no referrals
  if (referrals.length === 0) {
    return null;
  }

  const getStageColor = (stage: { color: string } | undefined): string => {
    return stage?.color || 'bg-gray-200';
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserPlusIcon className="h-6 w-6 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-800">Follow Your Referrals</h2>
        </div>
        <Link
          to="/referrals/my-referrals"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          See all
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {referrals.map((referral) => {
          const currentStage = referral.stages?.find(stage => stage.id === referral.status);
          const progress = referral.progress ?? 0;
          
          return (
            <div className="block p-4 border rounded-lg border-gray-200 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {referral.firstName} {referral.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <BriefcaseIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 truncate">
                      {referral.jobTitle}
                    </span>
                  </div>
                </div>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStageColor(currentStage)}`}>
                  {currentStage?.title || referral.status.toUpperCase()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getStageColor(currentStage)}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ReferralsWidget;

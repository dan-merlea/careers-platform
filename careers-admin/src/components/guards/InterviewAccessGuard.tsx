import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import interviewService from '../../services/interviewService';
import LoadingSpinner from '../common/LoadingSpinner';

interface InterviewAccessGuardProps {
  children: React.ReactNode;
  showUnauthorized?: boolean;
}

const InterviewAccessGuard: React.FC<InterviewAccessGuardProps> = ({ 
  children, 
  showUnauthorized = true 
}) => {
  const { id } = useParams<{ id: string }>();
  const { userId, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      
      try {
        // Admin, director, and recruiter roles always have access
        if (['admin', 'director', 'recruiter'].includes(userRole || '')) {
          setHasAccess(true);
          return;
        }
        
        // For user role, check if they are part of the interview
        if (userRole === 'user' && id && userId) {
          const interview = await interviewService.getInterviewById(id);
          
          // Check if the current user is an interviewer for this interview
          const isUserInterviewer = interview.interviewers.some(
            interviewer => interviewer.userId === userId
          );
          
          setHasAccess(isUserInterviewer);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking interview access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [id, userId, userRole]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" message="Checking access..." />
      </div>
    );
  }
  
  if (!hasAccess) {
    return showUnauthorized ? (
      <Navigate to="/unauthorized" replace />
    ) : null;
  }
  
  return <>{children}</>;
};

export default InterviewAccessGuard;

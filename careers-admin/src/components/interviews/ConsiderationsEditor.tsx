import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import interviewService from '../../services/interviewService';

export interface ConsiderationItem {
  id: string;
  title: string;
  description: string;
}

export interface Interview {
  id: string;
  stage?: string;
  processId?: string;
}

interface ConsiderationsEditorProps {
  interview?: Interview;
  isEditable: boolean;
  initialRatings?: { [key: string]: number };
  onRatingsChange?: (ratings: { [key: string]: number }) => void;
}

const ConsiderationsEditor: React.FC<ConsiderationsEditorProps> = ({
  interview,
  isEditable,
  initialRatings = {},
  onRatingsChange
}) => {
  const [considerations, setConsiderations] = useState<ConsiderationItem[]>([]);
  const [ratings, setRatings] = useState<{ [key: string]: number }>(initialRatings);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use a ref to track if considerations have been loaded for this interview
  const loadedInterviewId = React.useRef<string | null>(null);

  useEffect(() => {
    // Only load considerations if we have an interview and haven't loaded for this interview yet
    if (interview && interview.id && interview.id !== loadedInterviewId.current) {
      loadedInterviewId.current = interview.id;
      prepareConsiderations();      
    }
  }, [interview]);

  const prepareConsiderations = async () => {
    // Safety check - if we don't have a valid interview ID, don't proceed
    if (!interview || !interview.id) {
      console.error('Cannot prepare considerations: Invalid interview data');
      return;
    }
    
    // Fetch interview stage considerations
    setIsLoading(true);
    
    let stageConsiderations: ConsiderationItem[] = [];
    
    console.log('Interview has stage and processId:', { 
      stage: interview.stage, 
      processId: interview.processId 
    });

    try {
      // If the interview has a stage property, use it to fetch the appropriate considerations
      if (interview.stage && interview.processId) {
        
        // Get the interview process details
        const processResponse = await interviewService.getInterviewProcess(interview.processId);        
        if (processResponse && processResponse.stages && processResponse.stages.length > 0) {
          console.log('Process stages:', processResponse.stages);
          
          // Extract stage number from the interview stage
          // The stage format could be 'stage-1', 'stage-2', etc.
          let stageNumber: number | null = null;
          if (interview.stage) {
            const match = interview.stage.match(/stage-(\d+)/);
            if (match && match[1]) {
              stageNumber = parseInt(match[1], 10);
              console.log('Extracted stage number:', stageNumber);
            }
          }
          
          // Find the stage that matches the stage number
          let currentStage = null;          
          if (stageNumber !== null) {
            // Sort stages by order
            const sortedStages = [...processResponse.stages].sort((a, b) => a.order - b.order);
            
            // Try to find the stage by index (stage numbers are 0-based in the array)
            if (stageNumber < sortedStages.length) {
              currentStage = sortedStages[stageNumber];
              console.log('Found stage by number:', currentStage);
            }
          }
          
          if (currentStage) {
            console.log('Found matching stage:', currentStage);
            
            if (currentStage.considerations && currentStage.considerations.length > 0) {
              console.log('Stage has considerations:', currentStage.considerations);
              
              // Convert considerations array to our ConsiderationItem format
              stageConsiderations = currentStage.considerations.map(
                (consideration: any, index: number) => {
                  console.log('Processing consideration:', consideration);
                  return {
                    id: `consideration_${index}`,
                    title: consideration.title || 'Consideration',
                    description: consideration.description || ''
                  };
                }
              );
              console.log('Mapped considerations:', stageConsiderations);
            } else {
              console.log('Stage found but has no considerations');
            }
          } else {
            console.log('No matching stage found');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching interview stage considerations:', err);
    } finally {
      setIsLoading(false);
    }

    // Update the considerations state
    setConsiderations(stageConsiderations);
    
    // Always ensure we have at least the default considerations initialized
    const initialConsiderations: { [key: string]: number } = {};
    stageConsiderations.forEach((consideration: ConsiderationItem) => {
      if (!ratings[consideration.id]) {
        initialConsiderations[consideration.id] = 0;
      } else {
        initialConsiderations[consideration.id] = ratings[consideration.id];
      }
    });

    // Initialize ratings state with the loaded considerations
    setRatings(initialConsiderations);
    
    // Notify parent about ratings change
    if (onRatingsChange) {
      onRatingsChange(initialConsiderations);
    }

    console.log('Considerations initialized');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="medium" message="Loading considerations..." />
      </div>
    );
  }

  // Handle rating change for a consideration
  const handleRatingChange = (considerationId: string, rating: number) => {
    // Create a deep copy of the ratings object to ensure we're not modifying the original
    const updatedRatings = JSON.parse(JSON.stringify(ratings || {}));
    
    // Set the rating for this consideration
    updatedRatings[considerationId] = rating;
    
    // Update internal state
    setRatings(updatedRatings);
    
    // Notify parent component about the change
    if (onRatingsChange) {
      onRatingsChange(updatedRatings);
    }
  };

  if (considerations.length === 0) {
    return <EmptyState message="No considerations found for this interview stage." />;
  }

  return (
    <div className="space-y-4">
      {/* Debug logs */}
      {(() => { 
        console.log('Rendering feedback display with considerations:', considerations); 
        
        // Debug all consideration keys and values
        console.log('All consideration ratings:');
        if (ratings) {
          Object.keys(ratings).forEach(key => {
            console.log(`Key: ${key}, Value: ${ratings[key]}`);
          });
        }
        return null; 
      })()}
      {considerations.map((consideration) => (
        <div key={consideration.id} className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-grow pr-4">
              <h4 className="font-semibold text-blue-800">{consideration.title}</h4>
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
                {consideration.description}
              </div>
            </div>
            {isEditable ? (
              <div className="flex-shrink-0">
                <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 text-center">Your Rating</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(consideration.id, star)}
                        className={`${
                          (ratings[consideration.id] || 0) >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        } hover:text-yellow-400 focus:outline-none`}
                      >
                        <StarIcon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-500">
                    {(ratings[consideration.id] || 0) > 0
                      ? `${ratings[consideration.id]} out of 5`
                      : 'Not rated'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0">
                <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 text-center">Rating</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`${
                          (ratings[consideration.id] || 0) >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        <StarIcon className="h-5 w-5" />
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-center mt-1">
                    {(ratings[consideration.id] || 0) > 0
                      ? `${ratings[consideration.id]}/5`
                      : 'Not rated'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConsiderationsEditor;

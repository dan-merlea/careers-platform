'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

interface ApplicantData {
  firstName: string;
  lastName: string;
  status: string;
  jobTitle: string;
  availableTimeSlots?: TimeSlot[];
}

export default function TimeSlotsPage() {
  const params = useParams();
  const applicationId = params.applicationId as string;
  
  const [applicantData, setApplicantData] = useState<ApplicantData | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Get start of week (Monday)
  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Generate time slots for a day (9 AM to 6 PM, 30-minute intervals)
  function generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 7; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }

  const timeSlotOptions = generateTimeSlots();

  // Generate week days
  function getWeekDays(startDate: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }

  const weekDays = getWeekDays(currentWeekStart);

  // Format date for display
  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // Create slot key for tracking
  function getSlotKey(date: Date, time: string): string {
    return `${date.toISOString().split('T')[0]}_${time}`;
  }

  // Parse slot key back to date and time
  function parseSlotKey(key: string): { date: string; time: string } {
    const [date, time] = key.split('_');
    return { date, time };
  }

  // Fetch applicant data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/timeslots/${applicationId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch applicant data');
        }
        const data = await response.json();
        setApplicantData(data);
        
        // Load existing time slots
        if (data.availableTimeSlots && data.availableTimeSlots.length > 0) {
          setTimeSlots(data.availableTimeSlots);
          const slots = new Set<string>();
          data.availableTimeSlots.forEach((slot: TimeSlot) => {
            const date = new Date(slot.date);
            slots.add(getSlotKey(date, slot.startTime));
          });
          setSelectedSlots(slots);
          setIsEditMode(false); // Start in view mode if slots exist
        } else {
          setIsEditMode(true); // Start in edit mode if no slots
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    if (applicationId) {
      fetchData();
    }
  }, [applicationId]);

  // Handle slot selection
  const handleSlotClick = (date: Date, time: string) => {
    const key = getSlotKey(date, time);
    const newSelectedSlots = new Set(selectedSlots);
    
    if (newSelectedSlots.has(key)) {
      newSelectedSlots.delete(key);
    } else {
      newSelectedSlots.add(key);
    }
    
    setSelectedSlots(newSelectedSlots);
  };

  // Handle mouse drag for selecting multiple slots
  const handleMouseDown = (date: Date, time: string) => {
    setIsDragging(true);
    handleSlotClick(date, time);
  };

  const handleMouseEnter = (date: Date, time: string) => {
    if (isDragging) {
      const key = getSlotKey(date, time);
      const newSelectedSlots = new Set(selectedSlots);
      newSelectedSlots.add(key);
      setSelectedSlots(newSelectedSlots);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Save time slots
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Convert selected slots to TimeSlot format
      const slots: TimeSlot[] = Array.from(selectedSlots).map(key => {
        const { date, time } = parseSlotKey(key);
        const endHour = parseInt(time.split(':')[0]);
        const endMinute = parseInt(time.split(':')[1]) + 30;
        const endTime = endMinute === 60 
          ? `${(endHour + 1).toString().padStart(2, '0')}:00`
          : `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        return {
          date,
          startTime: time,
          endTime,
          timezone: userTimezone
        };
      });

      const response = await fetch(`/api/timeslots/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeSlots: slots }),
      });

      if (!response.ok) {
        throw new Error('Failed to save time slots');
      }

      setSuccessMessage('Time slots saved successfully!');
      setIsEditMode(false); // Switch to view mode after saving
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save time slots');
    } finally {
      setIsSaving(false);
    }
  };

  // Format time slots for display
  const groupedSlots = Array.from(selectedSlots).reduce((acc, key) => {
    const { date, time } = parseSlotKey(key);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(time);
    return acc;
  }, {} as Record<string, string[]>);

  // Format date range for each day
  const formatTimeRange = (times: string[]) => {
    if (times.length === 0) return '';
    const sorted = times.sort();
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
      const current = sorted[i];
      const prevMinutes = parseInt(prev.split(':')[0]) * 60 + parseInt(prev.split(':')[1]);
      const currentMinutes = current ? parseInt(current.split(':')[0]) * 60 + parseInt(current.split(':')[1]) : -1;

      if (currentMinutes - prevMinutes !== 30) {
        // End of range
        const endHour = parseInt(prev.split(':')[0]);
        const endMinute = parseInt(prev.split(':')[1]) + 30;
        const endTime = endMinute === 60 
          ? `${(endHour + 1).toString().padStart(2, '0')}:00`
          : `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        ranges.push(`${start} - ${endTime}`);
        start = current;
      }
      prev = current;
    }

    return ranges.join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !applicantData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Select Your Available Time Slots
          </h1>
          {applicantData && (
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Candidate:</span> {applicantData.firstName} {applicantData.lastName}</p>
              <p><span className="font-medium">Position:</span> {applicantData.jobTitle}</p>
              <p><span className="font-medium">Stage:</span> {applicantData.status}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        {isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> Click or drag to select time slots when you&apos;re available for an interview. 
              You can select multiple slots across different days. Click again to deselect.
            </p>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* View Mode - Show list of available slots */}
        {!isEditMode && selectedSlots.size > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Available Time Slots</h2>
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Edit Availability
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(groupedSlots).sort().map(([date, times]) => (
                <div key={date} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="font-medium text-gray-900">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatTimeRange(times)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {userTimezone}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Week Navigation */}
        {isEditMode && (
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousWeek}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Previous Week
          </button>
          <span className="text-sm font-medium text-gray-700">
            {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
          </span>
          <button
            onClick={goToNextWeek}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next Week →
          </button>
        </div>
        )}

        {/* Calendar Grid */}
        {isEditMode && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Time
                  </th>
                  {weekDays.map((day, index) => (
                    <th key={index} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {formatDate(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlotOptions.map((time) => (
                  <tr key={time}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {time}
                    </td>
                    {weekDays.map((day, dayIndex) => {
                      const key = getSlotKey(day, time);
                      const isSelected = selectedSlots.has(key);
                      return (
                        <td key={dayIndex} className="px-1 py-1">
                          <button
                            onMouseDown={() => handleMouseDown(day, time)}
                            onMouseEnter={() => handleMouseEnter(day, time)}
                            className={`w-full h-8 rounded transition-colors ${
                              isSelected
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            title={`${formatDate(day)} at ${time}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Save Button */}
        {isEditMode && (
        <div className="flex justify-center gap-3">
          {selectedSlots.size > 0 && timeSlots.length > 0 && (
            <button
              onClick={() => setIsEditMode(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || selectedSlots.size === 0}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : `Save ${selectedSlots.size} Time Slot${selectedSlots.size !== 1 ? 's' : ''}`}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

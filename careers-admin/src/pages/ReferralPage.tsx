import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import jobService from '../services/jobService';
import jobApplicationService, { CreateReferralRequest } from '../services/jobApplicationService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import TabNavigation from '../components/common/TabNavigation';
import MyReferralsList from '../components/referrals/MyReferralsList';
import { UserPlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const ReferralPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'refer' | 'my-referrals'>('refer');
  const { userId } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<CreateReferralRequest, 'resume' | 'refereeId'>>();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetch only published jobs
        const allJobs = await jobService.getAllJobs();
        const publishedJobs = allJobs.filter(job => job.status === 'published');
        setJobs(publishedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('There was an error fetching the available jobs.');
      }
    };

    fetchJobs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: Omit<CreateReferralRequest, 'resume' | 'refereeId'>) => {
    if (!resumeFile) {
      toast.error('Please upload a resume file.');
      return;
    }

    setIsLoading(true);

    try {
      const referralData: CreateReferralRequest = {
        ...data,
        resume: resumeFile,
        refereeId: userId || '',
      };

      await jobApplicationService.createReferral(referralData);
      
      toast.success('Your referral has been successfully submitted.');
      
      // Switch to the My Referrals tab instead of navigating away
      setActiveTab('my-referrals');
    } catch (error) {
      console.error('Error submitting referral:', error);
      toast.error('There was an error submitting your referral. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Referrals</h1>
        <p className="text-gray-600">Refer candidates and track your referrals</p>
      </div>
      
      <div className="mb-6">
        <TabNavigation
          tabs={[
            {
              id: 'refer',
              label: 'Refer a Candidate',
              icon: <UserPlusIcon className="w-5 h-5" />
            },
            {
              id: 'my-referrals',
              label: 'My Referrals',
              icon: <DocumentTextIcon className="w-5 h-5" />
            }
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as 'refer' | 'my-referrals')}
        />
      </div>
      
      {activeTab === 'refer' ? (

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 border border-gray-200 rounded-lg shadow-md">
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">First Name <span className="text-red-500">*</span></label>
            <input 
              {...register('firstName', { required: 'First name is required' })} 
              placeholder="Enter candidate's first name" 
              className={`w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Last Name <span className="text-red-500">*</span></label>
            <input 
              {...register('lastName', { required: 'Last name is required' })} 
              placeholder="Enter candidate's last name" 
              className={`w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Email <span className="text-red-500">*</span></label>
            <input 
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                }
              })} 
              placeholder="Enter candidate's email" 
              className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Phone</label>
            <input 
              {...register('phone')} 
              placeholder="Enter candidate's phone number (optional)" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">LinkedIn</label>
            <input 
              {...register('linkedin')} 
              placeholder="Enter candidate's LinkedIn profile URL (optional)" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Website</label>
            <input 
              {...register('website')} 
              placeholder="Enter candidate's website URL (optional)" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">How do you know this person and what makes them a good fit for this role? <span className="text-red-500">*</span></label>
            <textarea
              {...register('refereeRelationship', { required: 'Please describe your relationship with the candidate' })}
              placeholder="Describe how you know this candidate and why they would be a good fit for this position"
              rows={4}
              className={`w-full px-3 py-2 border ${errors.refereeRelationship ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.refereeRelationship && <p className="text-red-500 text-sm mt-1">{errors.refereeRelationship.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Job Position <span className="text-red-500">*</span></label>
            <select 
              {...register('jobId', { required: 'Please select a job position' })}
              className={`w-full px-3 py-2 border ${errors.jobId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select job position</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            {errors.jobId && <p className="text-red-500 text-sm mt-1">{errors.jobId.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Consent Duration (months) <span className="text-red-500">*</span></label>
            <select 
              {...register('consentDuration', { 
                required: 'Please select a consent duration',
                valueAsNumber: true
              })}
              className={`w-full px-3 py-2 border ${errors.consentDuration ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select consent duration</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
            {errors.consentDuration && <p className="text-red-500 text-sm mt-1">{errors.consentDuration.message}</p>}
            <p className="text-sm text-gray-500 mt-1">
              How long we can keep the candidate's information in our database
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Resume <span className="text-red-500">*</span></label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Accepted formats: PDF, DOC, DOCX, TXT (max 3MB)
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Referral'
            )}
          </button>
        </div>
      </form>
    ) : (
      <MyReferralsList />
    )}
    </div>
  );
};

export default ReferralPage;

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import jobService from '../../services/jobService';
import jobApplicationService, { CreateReferralRequest } from '../../services/jobApplicationService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import TabNavigation from '../../components/common/TabNavigation';
import MyReferralsList from '../../components/referrals/MyReferralsList';
import Select from '../../components/common/Select';
import { UserPlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ReferralPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  // Determine active tab based on URL path
  const activeTab = location.pathname.includes('/referrals/my-referrals') ? 'my-referrals' : 'refer';
  const { userId } = useAuth();
  
  const {
    register,
    handleSubmit,
    control,
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
        source: 'referral',
      };

      await jobApplicationService.createReferral(referralData);
      
      toast.success('Your referral has been successfully submitted.');
      
      // Navigate to the My Referrals tab instead
      navigate('/referrals/my-referrals');
    } catch (error) {
      console.error('Error submitting referral:', error);
      toast.error('There was an error submitting your referral. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-3 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Referrals</h1>
        <p className="text-gray-600">Refer candidates and track your referrals</p>
      </div>
      
      <div className="mb-6">
        <TabNavigation
          tabs={[
            {
              id: 'refer',
              label: 'Refer a Candidate',
              icon: <UserPlusIcon className="w-5 h-5" />,
              href: '/referrals'
            },
            {
              id: 'my-referrals',
              label: 'My Referrals',
              icon: <DocumentTextIcon className="w-5 h-5" />,
              href: '/referrals/my-referrals'
            }
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => {}}
        />
      </div>
      
      {activeTab === 'refer' ? (

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">First Name <span className="text-red-500">*</span></label>
            <Input 
              {...register('firstName', { required: 'First name is required' })} 
              placeholder="Enter candidate's first name" 
              className={errors.firstName ? 'ring-1 ring-red-500' : ''}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Last Name <span className="text-red-500">*</span></label>
            <Input 
              {...register('lastName', { required: 'Last name is required' })} 
              placeholder="Enter candidate's last name" 
              className={errors.lastName ? 'ring-1 ring-red-500' : ''}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Email <span className="text-red-500">*</span></label>
            <Input 
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                }
              })} 
              type="email"
              placeholder="Enter candidate's email" 
              className={errors.email ? 'ring-1 ring-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Phone</label>
            <Input 
              {...register('phone')} 
              type="tel"
              placeholder="Enter candidate's phone number (optional)" 
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">LinkedIn</label>
            <Input 
              {...register('linkedin')} 
              type="url"
              placeholder="Enter candidate's LinkedIn profile URL (optional)" 
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Website</label>
            <Input 
              {...register('website')} 
              type="url"
              placeholder="Enter candidate's website URL (optional)" 
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
            <Controller
              name="jobId"
              control={control}
              rules={{ required: 'Please select a job position' }}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onChange={(val) => field.onChange(val || '')}
                  allowEmpty
                  placeholder="Select job position"
                  className={`w-full ${errors.jobId ? 'ring-1 ring-red-500' : ''}`}
                  searchable
                  options={jobs.map((job) => ({ label: job.title, value: String(job.id) }))}
                />
              )}
            />
            {errors.jobId && <p className="text-red-500 text-sm mt-1">{errors.jobId.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Consent Duration (months) <span className="text-red-500">*</span></label>
            <Controller
              name="consentDuration"
              control={control}
              rules={{ required: 'Please select a consent duration' }}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onChange={(val) => field.onChange(val ? parseInt(val, 10) : undefined)}
                  allowEmpty
                  placeholder="Select consent duration"
                  className={`w-full ${errors.consentDuration ? 'ring-1 ring-red-500' : ''}`}
                  options={[
                    { label: '3 months', value: '3' },
                    { label: '6 months', value: '6' },
                    { label: '12 months', value: '12' },
                  ]}
                />
              )}
            />
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

          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            fullWidth
            leadingIcon={isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : undefined}
          >
            {isLoading ? 'Submitting...' : 'Submit Referral'}
          </Button>
        </div>
        </form>
      </Card>
    ) : (
      <MyReferralsList />
    )}
    </div>
  );
};

export default ReferralPage;

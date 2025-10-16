import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
// Import Job model to ensure it's registered
import '@/models/Job';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    console.log('Fetching application:', applicationId);
    await connectDB();

    // Check if ID is valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      console.log('Invalid ObjectId format');
      return NextResponse.json(
        { error: 'Invalid application ID format' },
        { status: 400 }
      );
    }

    const application = await JobApplication.findById(applicationId)
      .populate('jobId')
      .lean();

    console.log('Application found:', !!application);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Type assertion for populated jobId
    interface PopulatedApplication {
      firstName: string;
      lastName: string;
      status: string;
      companyId: any;
      jobId: { _id: any; title: string; roleId?: any } | any;
      availableTimeSlots?: any[];
    }

    const app = application as PopulatedApplication;
    const jobTitle = typeof app.jobId === 'object' && app.jobId?.title 
      ? app.jobId.title 
      : 'Unknown Position';

    // Build stages to find the stage title
    let stageTitle = app.status;
    
    // Get the job's roleId to find interview process
    const jobRoleId = typeof app.jobId === 'object' && app.jobId?.roleId 
      ? app.jobId.roleId 
      : null;

    if (jobRoleId) {
      // Find the interview process for this role
      const db = mongoose.connection.db;
      const interviewProcess = await db?.collection('interviewprocesses').findOne({ 
        jobRoleId: jobRoleId 
      });

      if (interviewProcess && interviewProcess.stages) {
        // Look for the stage in the interview process stages
        const stage = interviewProcess.stages.find((s: any) => 
          s._id.toString() === app.status
        );
        
        if (stage) {
          stageTitle = stage.title;
        }
      }
    }

    // If not found in interview process, check standard stages
    if (stageTitle === app.status) {
      const standardStages: Record<string, string> = {
        'new': 'New',
        'reviewed': 'Reviewed',
        'interviewing': 'Interviewing',
        'debrief': 'Debrief',
        'offered': 'Offered',
        'hired': 'Hired',
        'rejected': 'Rejected',
      };
      stageTitle = standardStages[app.status] || app.status;
    }

    const response = {
      firstName: app.firstName,
      lastName: app.lastName,
      status: stageTitle,
      jobTitle,
      companyId: app.companyId?.toString(),
      availableTimeSlots: app.availableTimeSlots || [],
    };

    console.log('Returning response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    await connectDB();

    const body = await request.json();
    const { timeSlots } = body;

    if (!Array.isArray(timeSlots)) {
      return NextResponse.json(
        { error: 'Invalid time slots format' },
        { status: 400 }
      );
    }

    // Update the application with new time slots
    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        availableTimeSlots: timeSlots,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Time slots saved successfully',
      availableTimeSlots: application.availableTimeSlots,
    });
  } catch (error) {
    console.error('Error saving time slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

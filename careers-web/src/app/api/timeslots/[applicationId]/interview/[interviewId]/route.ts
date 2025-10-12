import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string; interviewId: string } }
) {
  try {
    await connectDB();

    const { applicationId, interviewId } = params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { error: 'Invalid application ID format' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return NextResponse.json(
        { error: 'Invalid interview ID format' },
        { status: 400 }
      );
    }

    const application = await JobApplication.findById(applicationId)
      .populate('jobId')
      .lean();

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
      jobId: { title: string } | string;
      interviews?: Array<{
        _id: string;
        title: string;
        description?: string;
        scheduledDate?: Date;
        location?: string;
        stage?: string;
        availableTimeSlots?: Array<{
          date: string;
          startTime: string;
          endTime: string;
          timezone: string;
        }>;
      }>;
    }

    const app = application as PopulatedApplication;
    const jobTitle = typeof app.jobId === 'object' && app.jobId?.title 
      ? app.jobId.title 
      : 'Unknown Position';

    // Find the specific interview
    const interview = app.interviews?.find(
      (int) => int._id.toString() === interviewId
    );

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Get interview process to find duration
    let durationMinutes = 60; // Default
    try {
      const db = mongoose.connection.db;
      if (db) {
        const interviewsCollection = db.collection('interviews');
        const interviewDoc = await interviewsCollection.findOne({ 
          _id: new mongoose.Types.ObjectId(interviewId) 
        });
        
        if (interviewDoc?.processId) {
          const processesCollection = db.collection('interviewprocesses');
          const process = await processesCollection.findOne({ 
            _id: new mongoose.Types.ObjectId(interviewDoc.processId) 
          });
          
          if (process?.stages && process.stages.length > 0) {
            // Find the stage that matches the interview stage
            const stage = process.stages.find((s: { title: string }) => s.title === interview.stage);
            if (stage?.durationMinutes) {
              durationMinutes = stage.durationMinutes;
            } else if (process.stages[0]?.durationMinutes) {
              durationMinutes = process.stages[0].durationMinutes;
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching interview duration:', err);
      // Non-critical, continue with default
    }

    const response = {
      firstName: app.firstName,
      lastName: app.lastName,
      status: app.status,
      jobTitle,
      availableTimeSlots: interview.availableTimeSlots || [],
      interview: {
        title: interview.title,
        description: interview.description,
        scheduledDate: interview.scheduledDate,
        location: interview.location,
        stage: interview.stage,
        durationMinutes,
      },
    };

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
  { params }: { params: { applicationId: string; interviewId: string } }
) {
  try {
    await connectDB();

    const { applicationId, interviewId } = params;
    const body = await request.json();
    const { timeSlots } = body;

    if (!Array.isArray(timeSlots)) {
      return NextResponse.json(
        { error: 'Invalid time slots format' },
        { status: 400 }
      );
    }

    // Update the specific interview's time slots within the application
    const application = await JobApplication.findOneAndUpdate(
      { 
        _id: applicationId,
        'interviews._id': interviewId 
      },
      {
        $set: {
          'interviews.$.availableTimeSlots': timeSlots,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { error: 'Application or interview not found' },
        { status: 404 }
      );
    }

    // Find the updated interview
    const updatedInterview = application.interviews?.find(
      (int: { _id: { toString: () => string } }) => int._id.toString() === interviewId
    );

    return NextResponse.json({
      message: 'Time slots saved successfully',
      availableTimeSlots: updatedInterview?.availableTimeSlots || [],
    });
  } catch (error) {
    console.error('Error saving time slots:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// File type validation
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Security: Check for malicious content patterns
function containsMaliciousContent(buffer: Buffer): boolean {
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000));
  
  // Check for script tags
  if (/<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(content)) {
    return true;
  }
  
  // Check for common JavaScript patterns
  if (/javascript:/gi.test(content)) {
    return true;
  }
  
  // Check for eval, Function constructor
  if (/\beval\s*\(|new\s+Function\s*\(/gi.test(content)) {
    return true;
  }
  
  // Check for event handlers
  if (/on(load|error|click|mouse|key)\s*=/gi.test(content)) {
    return true;
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const coverLetter = formData.get('coverLetter') as string;
    const linkedinUrl = formData.get('linkedinUrl') as string;
    const jobId = formData.get('jobId') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const companyId = formData.get('companyId') as string;
    const resume = formData.get('resume') as File;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !jobId || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate resume file
    if (!resume || resume.size === 0) {
      return NextResponse.json(
        { error: 'Resume file is required' },
        { status: 400 }
      );
    }
    
    // Check file size
    if (resume.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Resume file size exceeds 5MB limit' },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(resume.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed' },
        { status: 400 }
      );
    }
    
    // Read file buffer for security checks
    const bytes = await resume.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Security check: Scan for malicious content
    if (containsMaliciousContent(buffer)) {
      return NextResponse.json(
        { error: 'File contains potentially malicious content and cannot be accepted' },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const fileExtension = resume.name.split('.').pop();
    const uniqueFilename = `${randomUUID()}.${fileExtension}`;
    
    // Save file to uploads directory
    const uploadsDir = join(process.cwd(), 'uploads', 'resumes');
    const filePath = join(uploadsDir, uniqueFilename);
    
    // Ensure uploads directory exists
    try {
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(filePath, buffer);
    } catch (err) {
      console.error('Error saving file:', err);
      return NextResponse.json(
        { error: 'Failed to save resume file' },
        { status: 500 }
      );
    }
    
    // Prepare application data
    const applicationData = {
      firstName,
      lastName,
      email,
      phone: phone || null,
      coverLetter: coverLetter || null,
      linkedinUrl: linkedinUrl || null,
      jobId,
      jobTitle,
      companyId,
      resumeFilename: uniqueFilename,
      resumeOriginalName: resume.name,
      resumePath: filePath,
      status: 'new',
      source: 'career_site',
      appliedAt: new Date().toISOString(),
    };
    
    // Send to backend API to store in database
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/job-applications/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit application');
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result._id,
    });
    
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process application' },
      { status: 500 }
    );
  }
}

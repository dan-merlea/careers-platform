import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    await connectDB();

    // Check if ID is valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID format' },
        { status: 400 }
      );
    }

    const company = await Company.findById(companyId).lean() as any;

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Return only public information
    const publicInfo = {
      companyName: company.name || '',
      logo: company.logo || '',
      slogan: company.slogan || '',
      primaryColor: company.primaryColor || '#3B82F6',
      secondaryColor: company.secondaryColor || '#8B5CF6',
    };

    return NextResponse.json(publicInfo);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

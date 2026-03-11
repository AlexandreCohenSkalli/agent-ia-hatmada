import { NextRequest, NextResponse } from 'next/server';

interface EmailTrackingData {
  emailId: string;
  event: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced';
  timestamp: string;
  metadata?: Record<string, any>;
}

// Mock database for tracking
const emailTrackingDatabase: Map<string, EmailTrackingData[]> = new Map();

export async function POST(request: NextRequest) {
  try {
    const { emailId, event, metadata } = await request.json();

    if (!emailId || !event) {
      return NextResponse.json(
        { error: 'emailId and event are required' },
        { status: 400 }
      );
    }

    const trackingData: EmailTrackingData = {
      emailId,
      event,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // Store in mock database
    if (!emailTrackingDatabase.has(emailId)) {
      emailTrackingDatabase.set(emailId, []);
    }
    emailTrackingDatabase.get(emailId)!.push(trackingData);

    return NextResponse.json({
      success: true,
      tracked: trackingData,
    });
  } catch (error) {
    console.error('Email tracking error:', error);
    return NextResponse.json(
      { error: 'Error tracking email' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get('emailId');

    if (!emailId) {
      return NextResponse.json(
        { error: 'emailId query parameter is required' },
        { status: 400 }
      );
    }

    const tracking = emailTrackingDatabase.get(emailId) || [];

    // Calculate statistics
    const stats = {
      sent: tracking.filter(t => t.event === 'sent').length,
      opened: tracking.filter(t => t.event === 'opened').length,
      clicked: tracking.filter(t => t.event === 'clicked').length,
      replied: tracking.filter(t => t.event === 'replied').length,
      bounced: tracking.filter(t => t.event === 'bounced').length,
      firstSentAt: tracking.find(t => t.event === 'sent')?.timestamp,
      lastEventAt:
        tracking.length > 0 ? tracking[tracking.length - 1].timestamp : null,
    };

    return NextResponse.json({
      emailId,
      events: tracking,
      stats,
    });
  } catch (error) {
    console.error('Email tracking GET error:', error);
    return NextResponse.json(
      { error: 'Error fetching tracking data' },
      { status: 500 }
    );
  }
}

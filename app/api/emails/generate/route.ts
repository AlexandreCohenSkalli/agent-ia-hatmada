import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProspectData {
  name: string;
  email: string;
  company: string;
  industry?: string;
  type: 'prospection' | 'coaching';
}

export async function POST(request: NextRequest) {
  try {
    const { prospects, type } = await request.json();

    if (!prospects || !Array.isArray(prospects)) {
      return NextResponse.json(
        { error: 'Prospects data required' },
        { status: 400 }
      );
    }

    const generatedEmails = await Promise.all(
      prospects.map((prospect: ProspectData) =>
        generateEmailWithOpenAI(prospect, type)
      )
    );

    return NextResponse.json({ emails: generatedEmails });
  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: 'Error generating emails' },
      { status: 500 }
    );
  }
}

async function generateEmailWithOpenAI(
  prospect: ProspectData,
  type: 'prospection' | 'coaching'
): Promise<any> {
  const website = type === 'prospection' ? 'hatmadaprospection.com' : 'hatmadacoaching.com';
  
  const serviceInfo =
    type === 'prospection'
      ? `
YOU ARE SELLING: HATMADA Prospection Service
- Externalizes B2B cold calling prospection
- Fills sales pipelines with qualified meetings
- Key benefits: Speed (results in days), Transparency (100% recorded calls analyzed by AI), ROI measurable, Flexibility (3 days/week minimum)
- Target: SMEs/Scale-ups (€2M-€80M)
- Best for: Companies with good products but struggling with sales pipeline
- Problems solved: Pipe leakage, low conversion, costly SDR management, inaccurate targeting
- Website: ${website}
`
      : `
YOU ARE SELLING: HATMADA Coaching Service
- Professional sales training and coaching for sales teams and entrepreneurs
- Services: Cold call mastery training, sales technique certification, closing strategy, sales pipeline management, post-training coaching
- Key benefits: Proven methodology, results tracked (avg +32% meetings, +19% revenue), customizable programs, ongoing support post-training
- Target: Sales directors, sales managers, CEOs/founders, HR departments, companies with sales teams
- Best for: Companies struggling with sales pipeline, low conversion rates, underperforming teams, or rapid scaling
- Problems solved: Sales reps avoiding calls, weak closing skills, inconsistent processes, high turnover, pipeline leakage, poor sales culture
- Website: ${website}
`;

  const prompt = `You are an expert B2B sales expert generating personalized cold emails in French.

${serviceInfo}

PROSPECT INFORMATION:
- Name: ${prospect.name}
- Email: ${prospect.email}
- Company: ${prospect.company}
- Industry/Sector: ${prospect.industry || 'Unknown'}

INSTRUCTIONS:
1. Write the email in FRENCH
2. Analyze the prospect's industry/company type to determine relevance
3. Write a personalized, engaging cold email subject line (max 60 chars)
4. Write an email body (3-5 paragraphs) that:
   - Opens with a relevant hook based on company type
   - Shows understanding of their potential needs
   - Presents your service as the solution
   - Creates urgency or clear next step
   - Keeps professional but conversational tone
   - Uses short sentences and paragraphs
   - Include the website URL (${website}) in the email signature
   - Always sign the email as: "Raphaël\nHatmada"
5. Response format MUST be exact JSON (no markdown, no backticks):

{
  "subject": "Email subject here",
  "body": "Full email body here"
}

Generate the email now. Remember: personalization based on company type is critical.`;

  const message = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text from the response
  const responseText = message.choices[0].message.content || '';

  try {
    // Try to parse JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        id: Math.random().toString(36).substr(2, 9),
        prospectName: prospect.name,
        prospectEmail: prospect.email,
        companyName: prospect.company,
        companyType: prospect.industry || 'Unknown',
        emailSubject: parsed.subject,
        emailBody: parsed.body,
        status: 'pending',
      };
    }
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
  }

  // Fallback if JSON parsing fails
  return {
    id: Math.random().toString(36).substr(2, 9),
    prospectName: prospect.name,
    prospectEmail: prospect.email,
    companyName: prospect.company,
    companyType: prospect.industry || 'Unknown',
    emailSubject: 'Discussion Intéressante',
    emailBody: responseText,
    status: 'pending',
  };
}

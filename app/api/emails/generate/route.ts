import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
        generateEmailWithClaude(prospect, type)
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

async function generateEmailWithClaude(
  prospect: ProspectData,
  type: 'prospection' | 'coaching'
): Promise<any> {
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
`
      : `
YOU ARE SELLING: Hatmada Coaching Service
- All-in-one platform for professional coaches (do NOT mention "Coaching.com" in the email — refer only to "nos services" or "notre plateforme")
- Components: Education (certifications, masterclasses), Software (client management, scheduling), Marketplace (coaches can list themselves), Community (1800+ global coaches)
- Key benefits: Complete solution, continuous learning, business growth, solitude elimination, scalability
- Target: Individual coaches, coaching companies, HR departments
- Best for: Coaches wanting to build and scale their practice
- Problems solved: Lack of tools, isolation, difficulty finding clients, limited growth potential
`;

  const prompt = `You are an expert B2B sales expert generating personalized cold emails.

${serviceInfo}

PROSPECT INFORMATION:
- Name: ${prospect.name}
- Email: ${prospect.email}
- Company: ${prospect.company}
- Industry/Sector: ${prospect.industry || 'Unknown'}

INSTRUCTIONS:
1. Analyze the prospect's industry/company type to determine relevance
2. Write a personalized, engaging cold email subject line (max 60 chars)
3. Write an email body (3-5 paragraphs) that:
   - Opens with a relevant hook based on company type
   - Shows understanding of their potential needs
   - Presents your service as the solution
   - Creates urgency or clear next step
   - Keeps professional but conversational tone
   - Uses short sentences and paragraphs
   - NEVER mention "Coaching.com" anywhere in the email — use "nos services" or "notre plateforme" instead
   - Always sign the email as: "Raphaël\nHatmada" — never use "[Votre nom]" or any placeholder
4. Response format MUST be exact JSON:

{
  "subject": "Email subject here",
  "body": "Full email body here"
}

Generate the email now. Remember: personalization based on company type is critical.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text from the response
  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

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

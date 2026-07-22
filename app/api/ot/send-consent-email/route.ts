// app/api/ot/send-consent-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getCaseById } from '@/lib/surgery-db';
import { authErrorResponse, requireRole } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Require doctor/admin role to send consent emails
    requireRole(req, ['doctor', 'admin']);

    const body = await req.json();
    const { caseId, email, patientName, surgeryName, consentUrl, doctorName } = body;

    // If caseId is provided, fetch case details
    let caseData = null;
    let finalEmail = email;
    let finalPatientName = patientName;
    let finalSurgeryName = surgeryName;
    let finalCaseId = caseId || null;

    if (caseId) {
      caseData = await getCaseById(caseId);
      if (caseData) {
        finalPatientName = caseData.patient?.name || patientName || 'Patient';
        finalSurgeryName = caseData.recommendation?.surgeryName || surgeryName || 'Surgery';
        
        // Use type assertion for email
        const patient = caseData.patient as any;
        finalEmail = email || patient?.email;
        
        finalCaseId = caseId;
        
        // If still no email, try to get it from patients table
        if (!finalEmail && caseData.patient?.id) {
          try {
            const { query } = await import('@/lib/db');
            const result = await query(
              'SELECT email FROM patients WHERE patient_id = $1',
              [caseData.patient.id]
            );
            if (result.rows.length > 0 && result.rows[0].email) {
              finalEmail = result.rows[0].email;
            }
          } catch (err) {
            console.warn('Could not fetch patient email:', err);
          }
        }
      } else {
        console.warn(`⚠️ Case ${caseId} not found, using provided data or defaults`);
      }
    }

    // ✅ If caseId is provided but case not found, still allow sending with provided data
    if (caseId && !caseData) {
      console.log(`📧 Case ${caseId} not found, but using provided data to send email`);
    }

    // Validate required fields
    if (!finalEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Patient email is required. Please provide an email address.' 
        },
        { status: 400 }
      );
    }

    if (!finalPatientName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Patient name is required.' 
        },
        { status: 400 }
      );
    }

    if (!finalSurgeryName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Surgery name is required.' 
        },
        { status: 400 }
      );
    }

    // Generate consent URL if not provided
    const finalConsentUrl = consentUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/ot/patient-consent-sign/${caseId || 'unknown'}`;

    // Build email HTML
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Surgical Consent</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf9f5; color: #1e293b;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #2bb2a7; padding-bottom: 20px; margin-bottom: 25px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Swasti Medical Centers & Clinics</h1>
          <p style="color: #1f8f89; margin: 8px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Secure EMR Digital Consent Hub</p>
        </div>
        
        <!-- Body -->
        <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.6; color: #0f172a;">Dear <strong>${finalPatientName}</strong>,</p>
          
          <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.7; color: #334155;">
            An informed surgical consent authorization document is ready for your digital signature. This documentation has been securely prepared regarding your upcoming procedure:
          </p>
          
          <!-- Surgery Details -->
          <div style="background-color: #f8fafc; border-left: 4px solid #1f8f89; padding: 18px 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 5px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Planned Surgical Procedure</p>
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #0f172a;">${finalSurgeryName}</p>
            ${finalCaseId ? `<p style="margin: 0; font-size: 12px; color: #64748b;">Case ID: <strong style="color: #0f172a;">${finalCaseId}</strong></p>` : ''}
            ${doctorName ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #475569;">Prepared by: <strong>Dr. ${doctorName}</strong></p>` : ''}
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0 25px 0;">
            <a href="${finalConsentUrl}" target="_blank" style="background-color: #1f8f89; color: #ffffff; padding: 15px 32px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(31, 143, 137, 0.3); text-transform: uppercase; letter-spacing: 0.05em; transition: background-color 0.2s;">
              📝 Review & Sign Consent
            </a>
          </div>

          <!-- Legal Note -->
          <div style="background-color: #fef9e7; border: 1px solid #fdebd0; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #78350f;">
              <strong>⚖️ Important Legal Note:</strong> Swasti digital signatures hold full legally binding equivalence under the Information Technology Act, 2000. Please review the detailed risks, benefits, and surgical disclosures completely before providing your signature.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px dashed #e2ddd2; padding-top: 20px; margin-top: 10px;">
          <p style="margin: 0 0 5px 0;">This email is securely dispatched by Swasti Hospital Information System (HIS).</p>
          <p style="margin: 0;">If you received this in error, please disregard or contact <a href="mailto:support@swasti.gov.in" style="color: #1f8f89; text-decoration: none;">support@swasti.gov.in</a></p>
          <p style="margin: 10px 0 0 0; font-size: 10px; color: #cbd5e1;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textBody = `
      Swasti Medical Centers & Clinics
      Secure EMR Digital Consent Hub

      Dear ${finalPatientName},

      An informed surgical consent authorization document is ready for your digital signature. This documentation has been securely prepared regarding your upcoming procedure:

      Planned Surgical Procedure: ${finalSurgeryName}
      ${finalCaseId ? `Case ID: ${finalCaseId}` : ''}
      ${doctorName ? `Prepared by: Dr. ${doctorName}` : ''}

      Please review and sign your consent document at the following link:
      ${finalConsentUrl}

      Important Legal Note: Swasti digital signatures hold full legally binding equivalence under the Information Technology Act, 2000. Please review the detailed risks, benefits, and surgical disclosures completely before providing your signature.

      This email is securely dispatched by Swasti Hospital Information System (HIS).
      If you received this in error, please disregard or contact support@swasti.gov.in

      This is an automated message. Please do not reply to this email.
    `;

    console.log(`📧 [Consent Email] Sending to: ${finalEmail}`);
    console.log(`📧 [Consent Email] Patient: ${finalPatientName}`);
    console.log(`📧 [Consent Email] Surgery: ${finalSurgeryName}`);
    console.log(`📧 [Consent Email] Case ID: ${finalCaseId || 'N/A'}`);
    console.log(`📧 [Consent Email] URL: ${finalConsentUrl}`);

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
      return NextResponse.json({
        success: false,
        error: 'Resend API key is not configured. Please set RESEND_API_KEY in your environment variables.',
        simulated: true,
        message: 'Email transmission simulated (RESEND_API_KEY not configured).',
        recipient: finalEmail,
        patientName: finalPatientName,
        surgeryName: finalSurgeryName,
        caseId: finalCaseId,
        consentUrl: finalConsentUrl,
      }, { status: 500 });
    }

    // Send email using Resend
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM || 'Swasti Consent Hub <onboarding@resend.dev>',
        to: [finalEmail],
        subject: `📋 Action Required: Surgical Consent for ${finalPatientName}`,
        html: htmlBody,
        text: textBody,
        replyTo: 'support@swasti.gov.in', // ✅ Fixed: replyTo (camelCase)
        headers: {
          'X-Entity-Ref-ID': finalCaseId || 'unknown',
        },
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        return NextResponse.json({
          success: false,
          error: error.message || 'Failed to send email via Resend',
          recipient: finalEmail,
        }, { status: 500 });
      }

      console.log(`✅ Consent email sent successfully! Email ID: ${data?.id}`);

      return NextResponse.json({
        success: true,
        message: `Consent email successfully sent to ${finalEmail}`,
        data: {
          emailId: data?.id,
          recipient: finalEmail,
          patientName: finalPatientName,
          surgeryName: finalSurgeryName,
          caseId: finalCaseId,
          consentUrl: finalConsentUrl,
        },
      });

    } catch (resendError: any) {
      console.error('❌ Resend Error:', resendError);
      return NextResponse.json({
        success: false,
        error: resendError.message || 'Failed to send email via Resend',
        recipient: finalEmail,
      }, { status: 500 });
    }

  } catch (err: any) {
    console.error('❌ Consent Email Dispatch Error:', err);
    
    // Check for auth errors
    const authResponse = authErrorResponse(err);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { 
        success: false, 
        error: err.message || 'Failed to send consent email.' 
      },
      { status: 500 }
    );
  }
}
// app/api/surgery/bill/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCases } from '@/lib/surgery-db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Patient ID is required. Use ?patientId=P-123' 
        },
        { status: 400 }
      );
    }

    // Get all cases
    const allCases = await getCases();
    
    // Filter cases by patient ID
    const patientCases = allCases.filter(
      c => c.patient.id === patientId || c.patient.admissionId === patientId
    );

    if (patientCases.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: `No surgery cases found for patient ID: ${patientId}` 
        },
        { status: 404 }
      );
    }

    // Process billing data (same as above)
    const bills = patientCases.map(surgeryCase => {
      const totalEstimated = surgeryCase.costEstimation.estimatedCost || 0;
      const totalActual = surgeryCase.billing.totalActualCost || 0;
      const patientPayable = surgeryCase.costEstimation.patientPayable || 0;
      const insurancePayable = surgeryCase.costEstimation.insurancePayable || 0;
      
      const breakdown = {
        surgeonFee: surgeryCase.billing.actualCharges.surgeonFee || 0,
        assistantFee: surgeryCase.billing.actualCharges.assistantFee || 0,
        otUsage: surgeryCase.billing.actualCharges.otUsage || 0,
        recoveryRoom: surgeryCase.billing.actualCharges.recoveryRoom || 0,
        anesthesia: surgeryCase.billing.actualCharges.anesthesia || 0,
        nursing: surgeryCase.billing.actualCharges.nursing || 0,
        implants: surgeryCase.billing.actualCharges.implants || 0,
        consumables: surgeryCase.billing.actualCharges.consumables || 0,
        medicines: surgeryCase.billing.actualCharges.medicines || 0,
        investigations: surgeryCase.billing.actualCharges.investigations || 0,
        roomCharges: surgeryCase.billing.actualCharges.roomCharges || 0,
      };

      return {
        caseId: surgeryCase.id,
        surgeryName: surgeryCase.recommendation.surgeryName,
        diagnosis: surgeryCase.recommendation.diagnosis,
        surgeryType: surgeryCase.recommendation.surgeryType,
        priorityLevel: surgeryCase.recommendation.priorityLevel,
        expectedDate: surgeryCase.recommendation.expectedDate,
        status: surgeryCase.status,
        billing: {
          estimatedCost: totalEstimated,
          actualCost: totalActual,
          patientPayable: patientPayable,
          insurancePayable: insurancePayable,
          isBilled: surgeryCase.billing.isBilled,
          billingDate: surgeryCase.billing.billingDate || 'Not billed yet',
          breakdown: breakdown,
        },
        insurance: {
          hasInsurance: surgeryCase.insurancePreAuth.hasInsurance,
          insuranceCompany: surgeryCase.insurancePreAuth.insuranceCompany || 'N/A',
          status: surgeryCase.insurancePreAuth.status || 'N/A',
        },
        summary: {
          balanceDue: patientPayable - (surgeryCase.billing.isBilled ? totalActual : 0),
          paymentStatus: surgeryCase.billing.isBilled ? 'Billed' : 'Pending',
        }
      };
    });

    // Calculate summary
    const summary = {
      totalCases: bills.length,
      totalEstimatedCost: bills.reduce((sum, b) => sum + b.billing.estimatedCost, 0),
      totalActualCost: bills.reduce((sum, b) => sum + b.billing.actualCost, 0),
      totalPatientPayable: bills.reduce((sum, b) => sum + b.billing.patientPayable, 0),
      totalInsurancePayable: bills.reduce((sum, b) => sum + b.billing.insurancePayable, 0),
      billedCases: bills.filter(b => b.billing.isBilled).length,
      pendingCases: bills.filter(b => !b.billing.isBilled).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        patientId: patientId,
        patientName: patientCases[0]?.patient.name || 'Unknown',
        patientDetails: {
          age: patientCases[0]?.patient.age,
          gender: patientCases[0]?.patient.gender,
          admissionId: patientCases[0]?.patient.admissionId,
          roomNumber: patientCases[0]?.patient.roomNumber,
          phone: patientCases[0]?.patient.phone,
          bloodGroup: patientCases[0]?.patient.bloodGroup,
        },
        summary: summary,
        bills: bills,
      }
    });

  } catch (error) {
    console.error('Error fetching patient bill data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch patient bill data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
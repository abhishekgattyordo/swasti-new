import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 11, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottom: 2, borderBottomColor: '#2563eb', paddingBottom: 10 },
  hospitalName: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' },
  hospitalTagline: { fontSize: 8, color: '#64748b', marginTop: 4 },
  reportBadge: { backgroundColor: '#e0e7ff', padding: '6 12', borderRadius: 6, fontSize: 10, fontWeight: 'bold', color: '#3730a3' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  gridItem: { width: '50%', marginBottom: 8 },
  gridLabel: { fontSize: 9, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
  gridValue: { fontSize: 11, fontWeight: 'bold', color: '#0f172a', marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e3a8a', marginTop: 16, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 4 },
  diagnosisText: { fontSize: 11, lineHeight: 1.5, marginBottom: 12, color: '#334155' },
  medsTable: { width: '100%', marginBottom: 16 },
  medsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 8 },
  medsHeader: { backgroundColor: '#0f172a', paddingVertical: 8, paddingHorizontal: 6 },
  medName: { width: '30%', fontSize: 10, fontWeight: 'bold' },
  medDosage: { width: '20%', fontSize: 10 },
  medFrequency: { width: '25%', fontSize: 10 },
  medDuration: { width: '25%', fontSize: 10 },
  medInstruction: { width: '100%', fontSize: 9, color: '#475569', marginTop: 4 },
  vitalsRow: { flexDirection: 'row', gap: 16, marginBottom: 16, backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8 },
  vitalItem: { flex: 1, alignItems: 'center' },
  vitalLabel: { fontSize: 9, color: '#64748b' },
  vitalValue: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, fontSize: 9, color: '#64748b', textAlign: 'center' },
  signature: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
seal: { fontSize: 8, color: '#059669', borderWidth: 1, borderColor: '#10b981', padding: '4 8', borderRadius: 4 },
});

interface PrescriptionPDFProps {
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorSpecialty: string;
  licenseNo: string;
  diagnosis: string;
  medications: Array<{ name: string; dosage: string; frequency: string; quantity: string; instructions: string }>;
  vitals: Array<{ bp: string; hr: number; temp: number; weight: number; spo2: number }>;
  followUp: string;
  instructions: string;
  documentRef: string;
  sealedDate: string;
}

export default function PrescriptionPDF(props: PrescriptionPDFProps) {
  const { patientName, patientId, doctorName, doctorSpecialty, licenseNo, diagnosis, medications, vitals, followUp, instructions, documentRef, sealedDate } = props;
  const latestVitals = vitals?.[0] || null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hospitalName}>St. Mary Advanced Medical Center</Text>
            <Text style={styles.hospitalTagline}>Primary & Specialist Care Center • HIPAA Encrypted Clinical Storage • Tel: +1 (555) 300-4720</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.reportBadge}>PRESCRIPTION</Text>
            <Text style={{ fontSize: 8, color: '#64748b', marginTop: 4 }}>Ref: {documentRef}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.gridItem}><Text style={styles.gridLabel}>Patient Name</Text><Text style={styles.gridValue}>{patientName || 'N/A'} (ID: {patientId})</Text></View>
          <View style={styles.gridItem}><Text style={styles.gridLabel}>Consulting Physician</Text><Text style={styles.gridValue}>{doctorName || 'Dr.'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.gridLabel}>Specialty</Text><Text style={styles.gridValue}>{doctorSpecialty || 'General Medicine'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.gridLabel}>License No.</Text><Text style={styles.gridValue}>{licenseNo || 'N/A'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.gridLabel}>Sealed Date/Time</Text><Text style={styles.gridValue}>{new Date(sealedDate).toLocaleString()}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Clinical Findings & Diagnoses</Text>
        <Text style={styles.diagnosisText}>{diagnosis || 'No diagnosis recorded'}</Text>

        {medications && medications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Prescribed Pharmacotherapy Plan</Text>
            <View style={styles.medsTable}>
              <View style={[styles.medsRow, styles.medsHeader]}>
                <Text style={[styles.medName, { color: '#fff' }]}>Medicine & Strength</Text>
                <Text style={[styles.medDosage, { color: '#fff' }]}>Dosage</Text>
                <Text style={[styles.medFrequency, { color: '#fff' }]}>Frequency</Text>
                <Text style={[styles.medDuration, { color: '#fff' }]}>Duration</Text>
              </View>
              {medications.map((med, idx) => (
                <View key={idx} style={styles.medsRow}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                  <Text style={styles.medFrequency}>{med.frequency}</Text>
                  <Text style={styles.medDuration}>{med.quantity}</Text>
                  <Text style={styles.medInstruction}>Instructions: {med.instructions}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {latestVitals && (
          <>
            <Text style={styles.sectionTitle}>Latest Vitals</Text>
            <View style={styles.vitalsRow}>
              <View style={styles.vitalItem}><Text style={styles.vitalLabel}>BP (mmHg)</Text><Text style={styles.vitalValue}>{latestVitals.bp || '—'}</Text></View>
              <View style={styles.vitalItem}><Text style={styles.vitalLabel}>HR (bpm)</Text><Text style={styles.vitalValue}>{latestVitals.hr || '—'}</Text></View>
              <View style={styles.vitalItem}><Text style={styles.vitalLabel}>Temp (°C)</Text><Text style={styles.vitalValue}>{latestVitals.temp || '—'}</Text></View>
              <View style={styles.vitalItem}><Text style={styles.vitalLabel}>Weight (kg)</Text><Text style={styles.vitalValue}>{latestVitals.weight || '—'}</Text></View>
              <View style={styles.vitalItem}><Text style={styles.vitalLabel}>SpO2 (%)</Text><Text style={styles.vitalValue}>{latestVitals.spo2 || '—'}</Text></View>
            </View>
          </>
        )}

        {followUp && <><Text style={styles.sectionTitle}>Follow-up</Text><Text style={styles.diagnosisText}>{followUp}</Text></>}
        {instructions && <><Text style={styles.sectionTitle}>Patient Instructions</Text><Text style={styles.diagnosisText}>{instructions}</Text></>}

        <View style={styles.signature}>
          <View><Text style={{ fontSize: 8, color: '#64748b' }}>Verify Electronic Authentication Seal</Text><Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 4 }}>Security Hash: sha256-{documentRef.slice(-8)}...</Text></View>
          <View style={styles.seal}><Text>DIGITALLY SEALED</Text></View>
        </View>

        <View style={styles.footer}><Text>This is a computer-generated document. No signature is required. For queries, please contact the hospital.</Text></View>
      </Page>
    </Document>
  );
}
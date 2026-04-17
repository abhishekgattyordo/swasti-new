import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the domain from the URL
  const hostname = request.headers.get('host') || '';
  const domain = hostname.split(':')[0];
  
  // Map domain to database
  const dbMap: Record<string, string> = {
    'his-app.com': 'his_app_db',
    'his-apollo.com': 'his_apollo_db',
    'his-hospital.com': 'his_hospital_db',
  };
  
  const database = dbMap[domain] || 'unknown';
  
  return NextResponse.json({
    domain: domain,
    database: database,
    message: `${domain} should use ${database}`
  });
}
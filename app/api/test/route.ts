import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('Testing Supabase server connection...');
    
    // Test Supabase connection
    const { data, error } = await supabaseServer
      .from('landing_page_content')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase server error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to Supabase',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('Supabase server connection successful');
    
    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Successfully connected to Supabase',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    },
  });
}

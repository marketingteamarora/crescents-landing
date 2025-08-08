import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import { defaultContent } from "@/lib/default-content"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Allow-Credentials': 'true',
}

// Revalidate every 60 seconds
export const revalidate = 60

// Helper function to create a response with CORS headers
function createResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}

export async function GET(request: Request) {
  console.log("=== New Request ===");
  console.log("Request URL:", request.url);
  console.log("Request Headers:", Object.fromEntries(request.headers.entries()));
  
  try {
    // First, verify the Supabase client is initialized
    if (!supabaseServer) {
      const errorMsg = "Supabase client not initialized";
      console.error(errorMsg);
      return createResponse(
        { 
          ...defaultContent, 
          _debug: { 
            error: errorMsg,
            timestamp: new Date().toISOString()
          } 
        },
        500
      );
    }

    console.log("Supabase client initialized, making query...");
    
    // Log environment variables (redacted for security)
    console.log("Environment variables:", {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...',
    });
    
    // Fetch the latest active content from Supabase using the server client
    console.log("Executing Supabase query...");
    const { data, error } = await supabaseServer
      .from("landing_page_content")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();
      
    console.log("Supabase query completed. Error:", error);
    console.log("Data received:", data ? "[data exists]" : "[no data]");

    if (error) {
      console.error("Error fetching content:", error);
      // Return default content with error information
      return createResponse(
        { 
          ...defaultContent, 
          _debug: { 
            error: 'Failed to fetch content from database',
            details: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
          } 
        },
        200
      );
    }

    // If no data found, return default content
    if (!data) {
      console.log("No active content found, returning default content");
      return createResponse({
        ...defaultContent,
        _debug: { 
          message: "No active content found in database",
          timestamp: new Date().toISOString()
        }
      });
    }

    console.log("Content found, returning data");
    
    // Return the content from the database
    return createResponse({
      ...defaultContent,
      ...data.content,
      _debug: {
        fetchedAt: new Date().toISOString(),
        contentId: data.id
      }
    });
  } catch (error) {
    console.error("API error:", error);
    
    // Return default content with error details
    const statusCode = error && typeof error === 'object' && 'status' in error 
      ? (error as any).status 
      : 200;
      
    return createResponse(
      { 
        ...defaultContent,
        _debug: { 
          error: error instanceof Error ? error.message : "Unknown error",
          stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : "UnknownError",
          timestamp: new Date().toISOString()
        }
      },
      statusCode
    )
  }
}

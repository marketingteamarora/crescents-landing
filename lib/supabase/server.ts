import { createClient } from "@supabase/supabase-js"

// This is a server-side only client that can be used in API routes
// It uses the service role key which bypasses RLS - use with caution!

// Log environment variables for debugging (in development only)
if (process.env.NODE_ENV === 'development') {
  console.log('Server - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
  console.log('Server - Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a function to get the Supabase client with proper error handling
const createServerClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    const errorMessage = 'Missing required Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables.';
    
    console.error('Server Supabase Configuration Error:', errorMessage);
    
    // Return a proxy that throws when any method is called
    return new Proxy({}, {
      get() {
        throw new Error(errorMessage);
      },
    }) as any;
  }

  // Create the Supabase client with the service role key
  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'X-Client-Info': 'crescents-landing-server/1.0',
      },
    },
  });

  // Add a simple health check in development
  if (process.env.NODE_ENV === 'development') {
    (async () => {
      try {
        const { error } = await client
          .from('landing_page_content')
          .select('id')
          .limit(1);
          
        if (error) {
          console.error('Server Supabase connection error:', error);
        } else {
          console.log('Server Supabase connected successfully');
        }
      } catch (error) {
        console.error('Server Supabase health check failed:', error);
      }
    })();
  }

  return client;
};

// Create and export the server-side Supabase client
export const supabaseServer = createServerClient();

// Export a type-safe version of the Supabase client
type SupabaseServerClient = ReturnType<typeof createClient>;

// Helper function to create a server client with the user's auth token
export const createServerClientWithToken = (accessToken: string) => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Cannot create client with token: Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${accessToken}`,
        'X-Client-Info': 'crescents-landing-server/1.0',
      },
    },
  });
};

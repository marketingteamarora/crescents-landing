import { createClient } from "@supabase/supabase-js"

// Log environment variables for debugging (in development only)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
  console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = 'Missing required Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.';
    
    console.error('Supabase Configuration Error:', errorMessage);
    
    // Return a dummy client that throws when used
    return new Proxy({}, {
      get() {
        throw new Error(errorMessage);
      },
    }) as any;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'crescents-auth-token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'X-Client-Info': 'crescents-landing/1.0',
      },
    },
  });

  // Add a simple health check in browser environment
  if (typeof window !== 'undefined') {
    // Use void to explicitly ignore the Promise
    void (async () => {
      try {
        const { error } = await client
          .from('landing_page_content')
          .select('id')
          .limit(1);
          
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connected successfully');
        }
      } catch (error) {
        console.error('Supabase health check failed:', error);
      }
    })();
  }

  return client;
};

// Create and export the Supabase client
export const supabase = createSupabaseClient();

// Export a type-safe version of the Supabase client
type SupabaseClient = ReturnType<typeof createClient>;

// Types for our database tables
export interface LandingPageContentRow {
  id: string
  content: any
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
  updated_by?: string
}

export interface ContentTemplateRow {
  id: string
  name: string
  description?: string
  content: any
  is_public: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface UploadedImageRow {
  id: string
  filename: string
  original_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  width?: number
  height?: number
  alt_text?: string
  category?: string
  created_at: string
  user_id: string
}

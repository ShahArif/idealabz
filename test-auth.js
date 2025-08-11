// Simple test script to verify Supabase authentication
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wgtvxjzkskcbiyagfkrg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndndHZ4anprc2tjYml5YWdma3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjMzNzAsImV4cCI6MjA2ODk5OTM3MH0.9ZLp69jtJ_DRhRqXRroo8Hg9jJgVVmSKAbkrk5xkx3U";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testAuth() {
  console.log('Testing Supabase authentication...');
  
  try {
    // Test 1: Check if we can connect
    console.log('1. Testing connection...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Connection error:', sessionError);
      return;
    }
    console.log('✓ Connection successful');
    
    // Test 2: Check if we can query the profiles table
    console.log('2. Testing database access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Database access error:', profilesError);
      return;
    }
    console.log('✓ Database access successful, found', profiles?.length || 0, 'profiles');
    
    // Test 3: Try to sign up a test user
    console.log('3. Testing user registration...');
    const testEmail = `test-${Date.now()}@ideas2it.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });
    
    if (signUpError) {
      console.error('Sign up error:', signUpError);
      return;
    }
    
    console.log('✓ Sign up successful for:', testEmail);
    console.log('User ID:', signUpData.user?.id);
    
    // Test 4: Check if profile was created
    if (signUpData.user?.id) {
      console.log('4. Checking if profile was created...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();
      
      if (profileError) {
        console.error('Profile fetch error:', profileError);
      } else if (profile) {
        console.log('✓ Profile created successfully:', profile);
      } else {
        console.log('✗ Profile not found - trigger function may not be working');
      }
    }
    
  } catch (error) {
    console.error('Test failed with exception:', error);
  }
}

testAuth();

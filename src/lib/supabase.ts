
import { createClient } from '@supabase/supabase-js';
import { type Database } from './database.types';

const supabaseUrl = 'https://ympwkvvuomlcvrptdeau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcHdrdnZ1b21sY3ZycHRkZWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzg2MTIsImV4cCI6MjA2Mjk1NDYxMn0.9D7BxzpoYUw-Ss2KZU400BwsGqsbz4aCkd0sihnoNKA';

// Create a single Supabase client to be used throughout the application
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
};

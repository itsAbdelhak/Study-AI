
import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT: SUPABASE SETUP FOR AI STUDIO ---
// 1. Get your Supabase Project URL and Anon Key from your Supabase Dashboard:
//    - Go to Project Settings > API.
//    - Under "Project API Keys", copy the URL and the "anon" "public" key.
// 2. Paste them directly into the createClient function below.
//    - Replace 'YOUR_PROJECT_URL_HERE' with your URL.
//    - Replace 'YOUR_ANON_KEY_HERE' with your anon key.
//
// ⚠️ WARNING: This method is ONLY for testing in environments like AI Studio
// where .env files are not supported. DO NOT commit these keys to a public
// repository like GitHub.

const supabaseUrl = 'https://blqwgloagwxhuiitshjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJscXdnbG9hZ3d4aHVpaXRzaGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTcxMzEsImV4cCI6MjA3ODAzMzEzMX0.lADDIMEWKkYNFzZC6jNvkuSJlrggxr6LkbAEcSzbaDk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- PRODUCTION SETUP (when deploying your real app) ---
// 1. Create a `.env.local` file in your project root.
// 2. Add your keys to the file:
//    NEXT_PUBLIC_SUPABASE_URL=your_project_url
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
// 3. Uncomment the code below and delete the testing setup above.

/*
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/


// --- DATABASE SETUP: PROFILES TABLE ---
// 1. Go to your Supabase Dashboard.
// 2. Navigate to the "SQL Editor".
// 3. Click "New query" and paste the following SQL code.
// 4. Click "Run" to create the table.
/*
  -- Create the profiles table
  create table profiles (
    id uuid references auth.users on delete cascade not null primary key,
    full_name text,
    updated_at timestamp with time zone
  );

  -- Set up Row Level Security (RLS)
  alter table profiles
    enable row level security;

  create policy "Public profiles are viewable by everyone." on profiles
    for select using (true);

  create policy "Users can insert their own profile." on profiles
    for insert with check (auth.uid() = id);

  create policy "Users can update own profile." on profiles
    for update using (auth.uid() = id);

  -- This trigger automatically creates a profile entry when a new user signs up
  create function public.handle_new_user()
  returns trigger as $$
  begin
    insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data->>'full_name');
    return new;
  end;
  $$ language plpgsql security definer;

  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
*/
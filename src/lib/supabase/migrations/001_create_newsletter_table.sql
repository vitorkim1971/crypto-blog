-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create Policy: Allow authenticated users (admins) to view subscribers
-- Service Role (used by API) automatically bypasses these policies
CREATE POLICY "Newsletter subscribers are viewable by authenticated users"
  ON public.newsletter_subscribers FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create Policy: Optional - Allow public execution if needed, but handled by Admin API mostly.
-- For safety, we keep it restricted. The API uses Service Role needed for Insert.

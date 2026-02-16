-- Create profile_requests table
CREATE TABLE IF NOT EXISTS public.profile_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dancer_id UUID NOT NULL REFERENCES public.dancers(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('claim', 'manager')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    note TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profile_requests_dancer_id ON public.profile_requests(dancer_id);
CREATE INDEX IF NOT EXISTS idx_profile_requests_requester_id ON public.profile_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_profile_requests_status ON public.profile_requests(status);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profile_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own requests" ON public.profile_requests
    FOR SELECT
    USING (auth.uid() = requester_id);

-- Policy: Users can insert their own requests
CREATE POLICY "Users can insert their own requests" ON public.profile_requests
    FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

-- Policy: Admin users can view all requests (assuming admins have a specific email domain or role)
-- Note: You need to implement admin check logic. For now, allowing all authenticated users to view
CREATE POLICY "Authenticated users can view all requests" ON public.profile_requests
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy: Admin users can update requests
CREATE POLICY "Admins can update requests" ON public.profile_requests
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profile_requests_updated_at BEFORE UPDATE ON public.profile_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.profile_requests IS 'Stores requests for dancer profile ownership and manager access';
COMMENT ON COLUMN public.profile_requests.type IS 'Type of request: claim (ownership) or manager (management access)';
COMMENT ON COLUMN public.profile_requests.status IS 'Request status: pending, approved, or rejected';

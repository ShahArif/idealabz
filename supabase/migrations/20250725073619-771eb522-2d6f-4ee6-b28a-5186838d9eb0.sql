-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'idealabs_core_team', 'idea_mentor', 'employee');

-- Create enum for idea categories
CREATE TYPE public.idea_category AS ENUM ('technology', 'process', 'product', 'service', 'other');

-- Create enum for idea stages
CREATE TYPE public.idea_stage AS ENUM ('pending', 'basic_review', 'tech_review', 'ready_for_pitch', 'mvp_poc');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role app_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create ideas table
CREATE TABLE public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    prd_url TEXT,
    tags TEXT[] DEFAULT '{}',
    category idea_category NOT NULL,
    stage idea_stage NOT NULL DEFAULT 'pending',
    submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create status updates table
CREATE TABLE public.status_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    previous_stage idea_stage,
    new_stage idea_stage NOT NULL,
    comment TEXT,
    action TEXT NOT NULL, -- 'accept', 'reject', 'send_back'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create file attachments table
CREATE TABLE public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$;

-- Create security definer function to check if user is core team or admin
CREATE OR REPLACE FUNCTION public.is_core_team_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id 
    AND role IN ('super_admin', 'idealabs_core_team')
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admin can update any profile" ON public.profiles
    FOR UPDATE USING (public.get_user_role(auth.uid()) = 'super_admin');

-- RLS Policies for ideas
CREATE POLICY "All authenticated users can view ideas" ON public.ideas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert ideas" ON public.ideas
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = submitted_by
    );

CREATE POLICY "Users can update own ideas" ON public.ideas
    FOR UPDATE USING (auth.uid() = submitted_by);

CREATE POLICY "Core team can update idea stages" ON public.ideas
    FOR UPDATE USING (public.is_core_team_or_admin(auth.uid()));

-- RLS Policies for comments
CREATE POLICY "All authenticated users can view non-internal comments" ON public.comments
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND (NOT is_internal OR public.is_core_team_or_admin(auth.uid()))
    );

CREATE POLICY "Authenticated users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = user_id
    );

CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for status updates
CREATE POLICY "All authenticated users can view status updates" ON public.status_updates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Core team can insert status updates" ON public.status_updates
    FOR INSERT WITH CHECK (
        public.is_core_team_or_admin(auth.uid()) 
        AND auth.uid() = updated_by
    );

-- RLS Policies for attachments
CREATE POLICY "All authenticated users can view attachments" ON public.attachments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert attachments" ON public.attachments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = uploaded_by
    );

CREATE POLICY "Users can update own attachments" ON public.attachments
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- Create storage bucket for file attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('idea-attachments', 'idea-attachments', false);

-- Storage policies for attachments
CREATE POLICY "Authenticated users can view attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'idea-attachments' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can upload attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'idea-attachments' 
        AND auth.role() = 'authenticated'
    );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_email TEXT;
BEGIN
    user_email := NEW.email;
    
    -- Only allow ideas2it.com email addresses
    IF user_email NOT LIKE '%@ideas2it.com' THEN
        RAISE EXCEPTION 'Only ideas2it.com email addresses are allowed';
    END IF;
    
    -- Insert into profiles table
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id, 
        user_email,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name',
        'employee'::app_role
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at
    BEFORE UPDATE ON public.ideas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_ideas_submitted_by ON public.ideas(submitted_by);
CREATE INDEX idx_ideas_stage ON public.ideas(stage);
CREATE INDEX idx_ideas_category ON public.ideas(category);
CREATE INDEX idx_ideas_created_at ON public.ideas(created_at);
CREATE INDEX idx_comments_idea_id ON public.comments(idea_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_status_updates_idea_id ON public.status_updates(idea_id);
CREATE INDEX idx_attachments_idea_id ON public.attachments(idea_id);
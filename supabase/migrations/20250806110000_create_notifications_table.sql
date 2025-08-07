-- Create notifications table for idea workflow
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'idea_created', 'product_expert_action', etc.
    message TEXT NOT NULL,
    link TEXT, -- URL to the idea or relevant page
    read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_idea_id ON public.notifications(idea_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can insert notifications for themselves (for system triggers)
CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

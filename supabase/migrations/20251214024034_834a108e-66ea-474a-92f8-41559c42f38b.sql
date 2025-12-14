-- Create social_posts table
CREATE TABLE public.social_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_publicacao timestamp with time zone NOT NULL,
  link text NOT NULL,
  tema text NOT NULL,
  texto text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - authenticated users can manage their own posts
CREATE POLICY "Users can view all social posts"
ON public.social_posts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert social posts"
ON public.social_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update social posts"
ON public.social_posts
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete social posts"
ON public.social_posts
FOR DELETE
TO authenticated
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_social_posts_updated_at
BEFORE UPDATE ON public.social_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- 1. Add hug_count column to community_posts table
ALTER TABLE public.community_posts
ADD COLUMN IF NOT EXISTS hug_count INTEGER DEFAULT 0;

-- 2. Update the trigger function to track both support and hug reaction changes
CREATE OR REPLACE FUNCTION public.update_support_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT Reaction
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'support' THEN
      UPDATE public.community_posts
      SET support_count = support_count + 1
      WHERE id = NEW.post_id;
    ELSIF NEW.type = 'hug' THEN
      UPDATE public.community_posts
      SET hug_count = hug_count + 1
      WHERE id = NEW.post_id;
    END IF;
  
  -- Handle DELETE Reaction
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'support' THEN
      UPDATE public.community_posts
      SET support_count = GREATEST(support_count - 1, 0)
      WHERE id = OLD.post_id;
    ELSIF OLD.type = 'hug' THEN
      UPDATE public.community_posts
      SET hug_count = GREATEST(hug_count - 1, 0)
      WHERE id = OLD.post_id;
    END IF;
  
  -- Handle UPDATE Reaction (e.g. changing reaction type)
  ELSIF TG_OP = 'UPDATE' THEN
    -- Decrement old reaction type
    IF OLD.type = 'support' AND NEW.type != 'support' THEN
      UPDATE public.community_posts
      SET support_count = GREATEST(support_count - 1, 0)
      WHERE id = OLD.post_id;
    ELSIF OLD.type = 'hug' AND NEW.type != 'hug' THEN
      UPDATE public.community_posts
      SET hug_count = GREATEST(hug_count - 1, 0)
      WHERE id = OLD.post_id;
    END IF;
    
    -- Increment new reaction type
    IF OLD.type != 'support' AND NEW.type = 'support' THEN
      UPDATE public.community_posts
      SET support_count = support_count + 1
      WHERE id = NEW.post_id;
    ELSIF OLD.type != 'hug' AND NEW.type = 'hug' THEN
      UPDATE public.community_posts
      SET hug_count = hug_count + 1
      WHERE id = NEW.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recalculate and catch up current hug reaction counts in the database
UPDATE public.community_posts cp
SET hug_count = (
  SELECT COUNT(*) FROM public.post_reactions pr
  WHERE pr.post_id = cp.id AND pr.type = 'hug'
);

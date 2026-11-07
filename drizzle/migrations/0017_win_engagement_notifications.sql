CREATE TABLE public.win_likes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 win_id uuid NOT NULL REFERENCES public.wins(id) ON DELETE CASCADE,
 user_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (win_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.win_likes TO authenticated;
GRANT ALL ON public.win_likes TO service_role;
ALTER TABLE public.win_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read win likes" ON public.win_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members like as themselves" ON public.win_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.wins w WHERE w.id = win_id));
CREATE POLICY "Members remove own likes" ON public.win_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.win_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 win_id uuid NOT NULL REFERENCES public.wins(id) ON DELETE CASCADE,
 user_id uuid NOT NULL,
 author_name text NOT NULL DEFAULT 'Member',
 body text NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 500),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.win_comments TO authenticated;
GRANT ALL ON public.win_comments TO service_role;
ALTER TABLE public.win_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read win comments" ON public.win_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members comment as themselves" ON public.win_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.wins w WHERE w.id = win_id));
CREATE POLICY "Authors and admins remove comments" ON public.win_comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX win_comments_win_created ON public.win_comments(win_id, created_at);

CREATE TABLE public.win_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 recipient_id uuid NOT NULL,
 actor_id uuid NOT NULL,
 actor_name text NOT NULL,
 win_id uuid NOT NULL REFERENCES public.wins(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK (kind IN ('like', 'comment')),
 like_id uuid UNIQUE REFERENCES public.win_likes(id) ON DELETE CASCADE,
 comment_id uuid UNIQUE REFERENCES public.win_comments(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(),
 read_at timestamptz
);
GRANT SELECT ON public.win_notifications TO authenticated;
GRANT UPDATE (read_at) ON public.win_notifications TO authenticated;
GRANT ALL ON public.win_notifications TO service_role;
ALTER TABLE public.win_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors read own win notifications" ON public.win_notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "Authors mark own notifications read" ON public.win_notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
CREATE INDEX win_notifications_recipient_created ON public.win_notifications(recipient_id, created_at DESC);

CREATE FUNCTION public.set_win_comment_author() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 NEW.author_name := COALESCE((SELECT NULLIF(btrim(display_name), '') FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1), 'Member');
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.set_win_comment_author() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER set_win_comment_author BEFORE INSERT ON public.win_comments FOR EACH ROW EXECUTE FUNCTION public.set_win_comment_author();

CREATE FUNCTION public.notify_win_author() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id uuid; actor text;
BEGIN
 SELECT user_id INTO owner_id FROM public.wins WHERE id = NEW.win_id;
 IF owner_id IS NULL OR owner_id = NEW.user_id THEN RETURN NEW; END IF;
 SELECT COALESCE(NULLIF(btrim(display_name), ''), 'Member') INTO actor FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
 IF TG_TABLE_NAME = 'win_likes' THEN
 INSERT INTO public.win_notifications(recipient_id, actor_id, actor_name, win_id, kind, like_id) VALUES (owner_id, NEW.user_id, COALESCE(actor, 'Member'), NEW.win_id, 'like', NEW.id);
 ELSE
 INSERT INTO public.win_notifications(recipient_id, actor_id, actor_name, win_id, kind, comment_id) VALUES (owner_id, NEW.user_id, COALESCE(actor, 'Member'), NEW.win_id, 'comment', NEW.id);
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_win_author() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_win_like AFTER INSERT ON public.win_likes FOR EACH ROW EXECUTE FUNCTION public.notify_win_author();
CREATE TRIGGER notify_win_comment AFTER INSERT ON public.win_comments FOR EACH ROW EXECUTE FUNCTION public.notify_win_author();
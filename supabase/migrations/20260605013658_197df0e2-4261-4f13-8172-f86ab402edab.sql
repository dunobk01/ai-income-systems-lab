UPDATE public.lessons l
SET content = s.content, action_steps = s.action_steps
FROM public._lesson_content_staging s
WHERE s.id = l.id;

DROP TABLE public._lesson_content_staging;
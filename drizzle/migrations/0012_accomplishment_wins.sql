ALTER TABLE public.wins ALTER COLUMN amount DROP NOT NULL;
COMMENT ON COLUMN public.wins.amount IS 'DEPRECATED: legacy revenue amount; accomplishment-based wins do not collect or display this field.';
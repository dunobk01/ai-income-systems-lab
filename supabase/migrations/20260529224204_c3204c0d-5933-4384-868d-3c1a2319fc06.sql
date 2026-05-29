create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);

grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;

alter table public.subscriptions enable row level security;

create policy "Users view own subscriptions"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins view all subscriptions"
  on public.subscriptions for select
  to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role inserts/updates (webhook uses service role, bypasses RLS anyway)

create trigger update_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.update_updated_at_column();

-- Helper to map price_id -> tier and upgrade profile
create or replace function public.apply_subscription_tier()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tier subscription_tier;
begin
  new_tier := case new.price_id
    when 'starter_onetime' then 'starter'::subscription_tier
    when 'builder_onetime' then 'builder'::subscription_tier
    when 'pro_onetime' then 'pro'::subscription_tier
    else null
  end;

  if new_tier is not null and new.status in ('active','trialing','complete','paid') then
    update public.profiles
    set tier = new_tier, updated_at = now()
    where user_id = new.user_id
    and (
      tier = 'none'
      or (tier = 'starter' and new_tier in ('builder','pro'))
      or (tier = 'builder' and new_tier = 'pro')
    );
  end if;
  return new;
end;
$$;

create trigger subscriptions_apply_tier
after insert or update on public.subscriptions
for each row execute function public.apply_subscription_tier();
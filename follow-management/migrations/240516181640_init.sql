create table if not exists
  public.follow (
    id bigint generated by default as identity primary key,
    user_id uuid references auth.users not null default auth.uid(),
    target_user_id uuid references auth.users not null,
    created_at TIMESTAMP not null DEFAULT now()
  );

ALTER TABLE public.follow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all users" ON public.follow FOR SELECT USING (true);

CREATE POLICY "Allow insert access to the owner" ON public.follow FOR INSERT TO authenticated with check (true);

CREATE POLICY "Allow update access to the owner" ON public.follow FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Allow delete access to the owner" ON public.follow FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.follow FORCE ROW LEVEL SECURITY;
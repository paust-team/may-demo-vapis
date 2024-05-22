create table IF not exists
  public.matches (
    id bigint generated by default as identity primary key,
    requester_id uuid references auth.users (id) NOT NULL DEFAULT auth.uid(),
    responder_id uuid references auth.users,
    status TEXT CHECK (status IN ('pending', 'approved', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP
  );

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read matching to all users" ON public.matches FOR SELECT USING (true);

CREATE POLICY "Allow insert matching to the owner" ON public.matches FOR INSERT TO authenticated with check (true);

CREATE POLICY "Allow update matching to the owner" ON public.matches FOR UPDATE TO authenticated USING (auth.uid () = requester_id);

CREATE POLICY "Allow delete matching to the owner" ON public.matches FOR DELETE TO authenticated USING (auth.uid () = requester_id);

CREATE POLICY "Allow delete matching to the admin" ON public.matches FOR DELETE TO service_role USING (true);
CREATE POLICY "Allow update matching to the admin" ON public.matches FOR UPDATE TO service_role USING (true);
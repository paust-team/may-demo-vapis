create table if not exists
  public.feeds (
    id bigint generated by default as identity primary key,
    user_id UUID REFERENCES auth.users (id) NOT NULL DEFAULT auth.uid(),
    title TEXT,
    description TEXT,
    feed_media VARCHAR(100),
    created_at TIMESTAMP not null DEFAULT now(),
    deleted_at TIMESTAMP
);

ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read feed to all users" ON public.feeds FOR SELECT USING (true);

CREATE POLICY "Allow insert feed to the users" ON public.feeds FOR INSERT TO authenticated with check (true);

CREATE POLICY "Allow update feed to the owner" ON public.feeds FOR UPDATE TO authenticated USING (auth.uid () = user_id);

CREATE POLICY "Allow delete feed to the owner" ON public.feeds FOR DELETE TO authenticated USING (auth.uid () = user_id);

CREATE POLICY "Allow delete feed to the admin" ON public.feeds FOR DELETE TO service_role USING (true);
CREATE POLICY "Allow update feed to the admin" ON public.feeds FOR UPDATE TO service_role USING (true);

insert into storage.buckets(id, name, public)
values ('feed-medias', 'feed-medias', true);

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read object to all users" ON storage.objects FOR SELECT USING (true);

CREATE POLICY "Allow insert object to all users" ON storage.objects FOR INSERT TO authenticated with check (true);

CREATE POLICY "Allow update object to the owner" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid() = owner);

CREATE POLICY "Allow delete object to the owner" ON storage.objects FOR DELETE TO authenticated USING (auth.uid() = owner);

CREATE POLICY "Allow all object to the admin" ON storage.objects FOR ALL TO service_role;
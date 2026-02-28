-- interviews テーブル
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  audio_url text,
  duration_seconds integer,
  status text not null default 'uploaded'
    check (status in ('uploaded', 'transcribing', 'analyzing', 'completed', 'error')),
  created_at timestamptz not null default now()
);

-- transcripts テーブル
create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid references public.interviews(id) on delete cascade not null,
  speaker text not null check (speaker in ('interviewer', 'interviewee')),
  content text not null,
  start_time float not null,
  end_time float not null
);

-- feedbacks テーブル
create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid references public.interviews(id) on delete cascade not null,
  overall_score integer not null check (overall_score between 1 and 100),
  summary text not null,
  filler_words jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb
);

-- RLS 有効化
alter table public.interviews enable row level security;
alter table public.transcripts enable row level security;
alter table public.feedbacks enable row level security;

-- interviews: ユーザーは自分のデータのみ CRUD 可能
create policy "Users can select own interviews"
  on public.interviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own interviews"
  on public.interviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own interviews"
  on public.interviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own interviews"
  on public.interviews for delete
  using (auth.uid() = user_id);

-- transcripts: interview の所有者のみアクセス可能
create policy "Users can select own transcripts"
  on public.transcripts for select
  using (
    interview_id in (
      select id from public.interviews where user_id = auth.uid()
    )
  );

create policy "Users can insert own transcripts"
  on public.transcripts for insert
  with check (
    interview_id in (
      select id from public.interviews where user_id = auth.uid()
    )
  );

create policy "Users can update own transcripts"
  on public.transcripts for update
  using (
    interview_id in (
      select id from public.interviews where user_id = auth.uid()
    )
  );

create policy "Users can delete own transcripts"
  on public.transcripts for delete
  using (
    interview_id in (
      select id from public.interviews where user_id = auth.uid()
    )
  );

-- feedbacks: interview の所有者のみアクセス可能
create policy "Users can select own feedbacks"
  on public.feedbacks for select
  using (
    interview_id in (
      select id from public.interviews where user_id = auth.uid()
    )
  );

create policy "Users can insert own feedbacks"
  on public.feedbacks for insert
  with check (
    interview_id in (
      select id from public.interviews where user_id = auth.uid()
    )
  );

create policy "Users can update own feedbacks"
  on public.feedbacks for update
  using (
    interview_id in (
      select id from public.interviews where user_id = auth.uid()
    )
  );

create policy "Users can delete own feedbacks"
  on public.feedbacks for delete
  using (
    interview_id in (
      select id from public.interviews where user_id = auth.uid()
    )
  );

-- Storage: interviews バケット作成
insert into storage.buckets (id, name, public)
values ('interviews', 'interviews', false);

-- Storage RLS: ユーザーは自分のフォルダのみアクセス可能
create policy "Users can upload own audio"
  on storage.objects for insert
  with check (
    bucket_id = 'interviews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own audio"
  on storage.objects for select
  using (
    bucket_id = 'interviews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own audio"
  on storage.objects for delete
  using (
    bucket_id = 'interviews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

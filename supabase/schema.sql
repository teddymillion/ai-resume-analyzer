-- AI Resume Analyzer - Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable Row Level Security
alter table if exists public.resumes enable row level security;
alter table if exists public.analysis_results enable row level security;

-- Create resumes table
create table if not exists public.resumes (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  parsed_text text,
  file_path text,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_resumes_created_at on public.resumes(created_at desc);

-- Create analysis_results table
create table if not exists public.analysis_results (
  id uuid not null default gen_random_uuid() primary key,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  overall_score integer,
  ats_score integer,
  feedback jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_analysis_resume_id on public.analysis_results(resume_id);

-- RLS Policies for resumes
drop policy if exists "Users can view their own resumes" on public.resumes;
create policy "Users can view their own resumes" on public.resumes
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own resumes" on public.resumes;
create policy "Users can insert their own resumes" on public.resumes
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own resumes" on public.resumes;
create policy "Users can delete their own resumes" on public.resumes
  for delete using (auth.uid() = user_id);

-- RLS Policies for analysis_results
drop policy if exists "Users can view their own analyses" on public.analysis_results;
create policy "Users can view their own analyses" on public.analysis_results
  for select using (
    auth.uid() in (select user_id from public.resumes where id = resume_id)
  );

drop policy if exists "Users can insert their own analyses" on public.analysis_results;
create policy "Users can insert their own analyses" on public.analysis_results
  for insert with check (
    auth.uid() in (select user_id from public.resumes where id = resume_id)
  );

drop policy if exists "Users can delete their own analyses" on public.analysis_results;
create policy "Users can delete their own analyses" on public.analysis_results
  for delete using (
    auth.uid() in (select user_id from public.resumes where id = resume_id)
  );

-- Create storage bucket (already exists in most cases, but ensure it)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select 'resumes', 'resumes', false, 10485760, array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
where not exists (select 1 from storage.buckets where id = 'resumes');

-- Storage policies
drop policy if exists "Users can upload their own resumes" on storage.objects;
create policy "Users can upload their own resumes" on storage.objects
  for insert with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (auth.uid())::text);

drop policy if exists "Users can view their own resumes" on storage.objects;
create policy "Users can view their own resumes" on storage.objects
  for select using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (auth.uid())::text);

drop policy if exists "Users can delete their own resumes" on storage.objects;
create policy "Users can delete their own resumes" on storage.objects
  for delete using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (auth.uid())::text);

comment on table public.resumes is 'Stored resumes with parsed text';
comment on table public.analysis_results is 'AI analysis results for resumes';
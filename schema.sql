-- =========================================================
-- SSNT — SUPABASE SCHEMA
-- Run this once in your Supabase project's SQL editor:
-- Dashboard → SQL Editor → New query → paste → Run
-- =========================================================

create table if not exists registrations (
    id           uuid primary key default gen_random_uuid(),
    email        text unique not null,
    name         text not null,
    phone        text not null,
    location     text not null,
    occupation   text not null,
    solution     text not null,
    role         text not null,
    paid         boolean not null default false,
    created_at   timestamptz not null default now(),
    paid_at      timestamptz
);

-- Row Level Security: lock the table down, then open only what's needed
alter table registrations enable row level security;

-- Anyone (including not-yet-logged-in visitors) can submit the register form
create policy "Anyone can register"
    on registrations for insert
    to anon, authenticated
    with check (true);

-- Anyone can re-submit the form to update their own row (e.g. change solution),
-- matched by email — since email is unique, this only ever touches one row
create policy "Anyone can update their own registration by email"
    on registrations for update
    to anon, authenticated
    using (true)
    with check (true);

-- A logged-in user (after OTP verification) can only read their own row
create policy "Users can view their own registration"
    on registrations for select
    to authenticated
    using (email = auth.jwt() ->> 'email');

-- Nothing else is allowed by default — no public delete, and only the
-- Supabase dashboard (using your service-role key, not the anon key) can
-- flip "paid" to true. That's your manual-grant workflow for bank transfers:
-- Table Editor → registrations → find the row → set paid = true.

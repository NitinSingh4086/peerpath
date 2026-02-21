-- ============================================================
-- PeerPath — Chat System Schema
-- Run this in Supabase SQL Editor (after the original schema)
-- ============================================================

-- ─── Conversations ───────────────────────────────────────────
-- A conversation belongs to a post (or is a direct/group chat)
create table if not exists conversations (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid references posts(id) on delete set null,
  title       text,              -- used for group chats
  is_group    boolean default false,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz default now()
);

-- ─── Conversation Members ─────────────────────────────────────
create table if not exists conversation_members (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  user_id         uuid references profiles(id) on delete cascade not null,
  joined_at       timestamptz default now(),
  unique(conversation_id, user_id)
);

-- ─── Messages ─────────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id       uuid references profiles(id) on delete set null not null,
  body            text not null,
  created_at      timestamptz default now()
);

-- ─── RLS ──────────────────────────────────────────────────────
alter table conversations         enable row level security;
alter table conversation_members  enable row level security;
alter table messages              enable row level security;

-- Conversations: members can see their conversations
create policy "Members can view their conversations" on conversations
  for select using (
    exists (
      select 1 from conversation_members
      where conversation_id = conversations.id and user_id = auth.uid()
    )
  );
create policy "Auth users can create conversations" on conversations
  for insert with check (auth.uid() = created_by);

-- Members
create policy "Members can view members" on conversation_members
  for select using (
    exists (
      select 1 from conversation_members cm
      where cm.conversation_id = conversation_members.conversation_id and cm.user_id = auth.uid()
    )
  );
create policy "Auth users can add members" on conversation_members
  for insert with check (auth.uid() is not null);
create policy "Members can leave" on conversation_members
  for delete using (auth.uid() = user_id);

-- Messages: only members can read/send
create policy "Members can view messages" on messages
  for select using (
    exists (
      select 1 from conversation_members
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );
create policy "Members can send messages" on messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from conversation_members
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

-- ─── Realtime ─────────────────────────────────────────────────
-- Enable realtime for messages table
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversation_members;

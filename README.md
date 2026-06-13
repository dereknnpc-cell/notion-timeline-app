# Family Credit Card Hub

A simple cloud-shareable hub for tracking Thai & Taiwan family credit cards,
optimizing for airline miles vs. cashback vs. payment deferral, and reminding
the family about due dates and promo registrations.

Built with Vite + React + Tailwind + Supabase (auth + storage).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key (optional)
npm run dev
```

If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing, the app falls
back to localStorage-only mode (single device, no family sync).

## Supabase setup

1. Create a free Supabase project at https://supabase.com/dashboard.
2. **SQL Editor → New query** → paste the contents of
   `supabase/migrations/20260613_init.sql` → Run.
3. **Authentication → Providers → Google** → enable. Add your production URL
   and `http://localhost:5173` to **Redirect URLs**.
4. Copy `Project URL` and `anon public` key into Vercel
   (**Settings → Environment Variables**) as
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Redeploy on Vercel.

## Family group model

- Each Google account belongs to one family group.
- All members of a group share the same data (members, cards, transactions,
  promotions, reminders).
- Inviting a family member: copy the **Invite Code** (the family UUID from
  the header) and have them sign in then paste it on the "Join family" screen.

## Tabs

- **Dashboard** — credit-line summary, upcoming payments, today's best card,
  pending promo registrations, recent transactions.
- **Members** — add/remove family members, assign supplementary-card holders.
- **Cards** — pick from the built-in TH/TW card catalog and assign to members.
- **Best card** — given a purchase, rank cards by miles / cashback / defer.
- **Transactions** — log purchases and aggregate monthly rewards.
- **Promotions** — current bank offers; red badge = registration required.
- **Reminders** — payment due dates per card, with overdue highlighting.

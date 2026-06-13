import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// All useFamilyState hooks for the same family share a single pending write
// buffer and flush timer, so concurrent updates to different keys merge into
// one upsert instead of racing each other's read-modify-write cycles.

const pending = new Map();   // family_id -> { patch, timer, version }
const FLUSH_DELAY_MS = 250;

async function flush(familyId) {
  const entry = pending.get(familyId);
  if (!entry || !supabase) return;
  const patch = entry.patch;
  entry.patch = {};
  entry.timer = null;
  if (Object.keys(patch).length === 0) return;
  const { data } = await supabase
    .from('family_state')
    .select('state')
    .eq('family_id', familyId)
    .single();
  const merged = { ...(data?.state ?? {}), ...patch };
  await supabase
    .from('family_state')
    .update({ state: merged, updated_at: new Date().toISOString() })
    .eq('family_id', familyId);
}

function schedulePatch(familyId, key, next) {
  if (!supabase) return;
  let entry = pending.get(familyId);
  if (!entry) {
    entry = { patch: {}, timer: null };
    pending.set(familyId, entry);
  }
  entry.patch[key] = next;
  if (entry.timer) clearTimeout(entry.timer);
  entry.timer = setTimeout(() => { flush(familyId); }, FLUSH_DELAY_MS);
}

export function useFamilyState(family, key, initial) {
  const [value, setLocalValue] = useState(initial);
  const familyId = family?.id ?? null;

  // Pull initial value when family changes.
  useEffect(() => {
    if (!family || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('family_state')
        .select('state')
        .eq('family_id', family.id)
        .single();
      if (cancelled || error) return;
      const next = data?.state?.[key];
      if (next !== undefined) setLocalValue(next);
    })();
    return () => { cancelled = true; };
  }, [family?.id, key]);

  // Subscribe to realtime updates so other family members' edits appear live.
  useEffect(() => {
    if (!family || !supabase) return;
    const channel = supabase
      .channel(`family_state:${family.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'family_state', filter: `family_id=eq.${family.id}` },
        payload => {
          const next = payload.new?.state?.[key];
          if (next !== undefined) setLocalValue(next);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [family?.id, key]);

  const setValue = (updater) => {
    setLocalValue(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (familyId) schedulePatch(familyId, key, next);
      return next;
    });
  };

  return [value, setValue];
}

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// Reads/writes a single JSONB row keyed on family_id. Each "key" maps to a
// sub-field inside the JSON blob so all hooks share one row + one realtime
// subscription per family.
//
// Falls back to in-memory state when no family is selected.

export function useFamilyState(family, key, initial) {
  const [value, setLocalValue] = useState(initial);
  const versionRef = useRef(0);
  const writeTimer = useRef(null);

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
      if (cancelled) return;
      if (error) return;
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
      if (family && supabase) {
        const myVersion = ++versionRef.current;
        if (writeTimer.current) clearTimeout(writeTimer.current);
        writeTimer.current = setTimeout(async () => {
          if (myVersion !== versionRef.current) return;
          const { data } = await supabase
            .from('family_state')
            .select('state')
            .eq('family_id', family.id)
            .single();
          const merged = { ...(data?.state ?? {}), [key]: next };
          await supabase
            .from('family_state')
            .update({ state: merged, updated_at: new Date().toISOString() })
            .eq('family_id', family.id);
        }, 250);
      }
      return next;
    });
  };

  return [value, setValue];
}

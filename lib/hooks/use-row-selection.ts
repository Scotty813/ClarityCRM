"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

export function useRowSelection(filteredIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Auto-prune selections that are no longer in the filtered set
  useEffect(() => {
    setSelectedIds((prev) => {
      const filteredSet = new Set(filteredIds);
      const pruned = new Set<string>();
      for (const id of prev) {
        if (filteredSet.has(id)) pruned.add(id);
      }
      if (pruned.size === prev.size) return prev;
      return pruned;
    });
  }, [filteredIds]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = filteredIds.length > 0 && filteredIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(filteredIds);
    });
  }, [filteredIds]);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const count = selectedIds.size;

  const isAllSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const isSomeSelected = !isAllSelected && filteredIds.some((id) => selectedIds.has(id));

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    selectedIds: selectedArray,
    isAllSelected,
    isSomeSelected,
    toggle,
    toggleAll,
    clear,
    count,
  };
}

"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

export function ForceLightMode() {
  const { setTheme, theme } = useTheme();
  const previousTheme = useRef<string | undefined>(undefined);

  useEffect(() => {
    previousTheme.current = theme;
    setTheme("light");

    return () => {
      if (previousTheme.current && previousTheme.current !== "light") {
        setTheme(previousTheme.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

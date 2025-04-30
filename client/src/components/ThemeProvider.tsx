import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  highContrast: boolean;
  textSize: "normal" | "large" | "xl";
  setTheme: (theme: Theme) => void;
  toggleHighContrast: () => void;
  setTextSize: (size: "normal" | "large" | "xl") => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  highContrast: false,
  textSize: "normal",
  setTheme: () => null,
  toggleHighContrast: () => null,
  setTextSize: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [highContrast, setHighContrast] = useState<boolean>(
    () => localStorage.getItem("high-contrast") === "true"
  );
  
  const [textSize, setTextSize] = useState<"normal" | "large" | "xl">(
    () => (localStorage.getItem("text-size") as "normal" | "large" | "xl") || "normal"
  );

  useEffect(() => {
    const root = document.documentElement;
    
    // Set data-theme attribute for light/dark mode
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      
      root.classList.toggle("dark", systemTheme === "dark");
      root.classList.toggle("light", systemTheme === "light");
    } else {
      root.classList.toggle("dark", theme === "dark");
      root.classList.toggle("light", theme === "light");
    }
    
    // Apply high contrast if enabled
    root.classList.toggle("high-contrast", highContrast);
    
    // Apply text size
    root.classList.remove("text-size-normal", "text-size-large", "text-size-xl");
    root.classList.add(`text-size-${textSize}`);
    
    localStorage.setItem(storageKey, theme);
    localStorage.setItem("high-contrast", highContrast.toString());
    localStorage.setItem("text-size", textSize);
  }, [theme, highContrast, textSize, storageKey]);

  const value = {
    theme,
    highContrast,
    textSize,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
    toggleHighContrast: () => {
      setHighContrast(prev => !prev);
    },
    setTextSize: (size: "normal" | "large" | "xl") => {
      setTextSize(size);
    }
  };

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
};

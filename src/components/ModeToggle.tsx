
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function ModeToggle() {
  const { currentTheme, toggleTheme } = useTheme();
  const isDark = currentTheme.type === 'masculine';

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative">
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${isDark ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

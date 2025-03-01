
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  icon: ReactNode;
  pageType: 'diary' | 'budget' | 'notes' | 'calendar' | 'security' | 'settings' | 'goals';
}

export function PageLayout({ children, title, icon, pageType }: PageLayoutProps) {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  
  // Get the specific color for this page type from the theme
  const pageColor = currentTheme.pageColors[pageType];
  const isDark = currentTheme.type === 'masculine';
  
  const gradientFrom = isDark ? currentTheme.backgroundGradient.from : 'purple-50';
  const gradientTo = isDark ? currentTheme.backgroundGradient.to : 'white';
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`}
         style={{ "--page-bg-color": pageColor } as React.CSSProperties}>
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 ml-16 sm:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="mr-4 md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <div className="mr-2 p-1 rounded" style={{ backgroundColor: pageColor }}>
                  {icon}
                </div>
                <h1 className="text-xl font-semibold">{title}</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main 
        className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        style={{ 
          "--page-accent-color": pageColor 
        } as React.CSSProperties}
      >
        {children}
      </main>
    </div>
  );
}

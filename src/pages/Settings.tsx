
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const navigate = useNavigate();
  const { currentTheme, setTheme, themes } = useTheme();

  const masculineThemes = themes.filter(theme => theme.type === 'masculine');
  const feminineThemes = themes.filter(theme => theme.type === 'feminine');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Theme Selection</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-3">Masculine Themes</h3>
                  <RadioGroup
                    value={currentTheme.id}
                    onValueChange={setTheme}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  >
                    {masculineThemes.map((theme) => (
                      <div key={theme.id} className="space-y-2">
                        <RadioGroupItem
                          value={theme.id}
                          id={theme.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={theme.id}
                          className="flex flex-col items-center justify-center w-full p-4 border-2 rounded-lg cursor-pointer hover:border-primary peer-data-[state=checked]:border-primary"
                          style={{
                            backgroundColor: theme.primaryColor,
                            borderColor: theme.accentColor,
                          }}
                        >
                          <span className="text-sm font-medium" style={{ color: theme.secondaryColor }}>
                            {theme.name}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-3">Feminine Themes</h3>
                  <RadioGroup
                    value={currentTheme.id}
                    onValueChange={setTheme}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  >
                    {feminineThemes.map((theme) => (
                      <div key={theme.id} className="space-y-2">
                        <RadioGroupItem
                          value={theme.id}
                          id={theme.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={theme.id}
                          className="flex flex-col items-center justify-center w-full p-4 border-2 rounded-lg cursor-pointer hover:border-primary peer-data-[state=checked]:border-primary"
                          style={{
                            backgroundColor: theme.primaryColor,
                            borderColor: theme.accentColor,
                          }}
                        >
                          <span className="text-sm font-medium" style={{ color: theme.secondaryColor }}>
                            {theme.name}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Settings;

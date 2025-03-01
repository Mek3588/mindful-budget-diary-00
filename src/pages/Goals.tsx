
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Target, CheckSquare, Calendar as CalendarIcon, PlusCircle, Trash2, Star, Trophy, Award } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: Date | undefined;
  progress: number;
  category: string;
  steps: GoalStep[];
  isPinned: boolean;
  isCompleted: boolean;
}

interface GoalStep {
  id: string;
  description: string;
  isCompleted: boolean;
}

const CATEGORIES = [
  { id: "personal", name: "Personal" },
  { id: "career", name: "Career" },
  { id: "health", name: "Health" },
  { id: "finance", name: "Finance" },
  { id: "relationships", name: "Relationships" },
  { id: "education", name: "Education" },
];

const REWARDS = {
  personal: {
    icon: <Trophy className="h-6 w-6 text-indigo-500" />,
    message: "Personal milestone achieved! You're growing every day."
  },
  career: {
    icon: <Award className="h-6 w-6 text-blue-500" />,
    message: "Career goal completed! Your professional growth is impressive."
  },
  health: {
    icon: <Award className="h-6 w-6 text-green-500" />,
    message: "Health goal achieved! Your wellbeing journey is inspiring."
  },
  finance: {
    icon: <Award className="h-6 w-6 text-yellow-500" />,
    message: "Financial goal reached! Your smart planning is paying off."
  },
  relationships: {
    icon: <Award className="h-6 w-6 text-pink-500" />,
    message: "Relationship goal accomplished! Connecting with others is a valuable skill."
  },
  education: {
    icon: <Award className="h-6 w-6 text-purple-500" />,
    message: "Educational goal completed! Your commitment to learning is admirable."
  }
};

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const savedGoals = localStorage.getItem("goals");
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  
  const [newGoal, setNewGoal] = useState<Goal>({
    id: "",
    title: "",
    description: "",
    deadline: undefined,
    progress: 0,
    category: "personal",
    steps: [],
    isPinned: false,
    isCompleted: false
  });
  
  const [newStep, setNewStep] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [date, setDate] = useState<Date>();
  const [showReward, setShowReward] = useState<{show: boolean, category: string} | null>(null);

  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem("goals", JSON.stringify(updatedGoals));
  };

  const handleAddGoal = () => {
    if (!newGoal.title) {
      toast.error("Please enter a goal title");
      return;
    }
    
    const goalToAdd = {
      ...newGoal,
      id: Date.now().toString(),
      deadline: date,
    };
    
    const updatedGoals = [...goals, goalToAdd];
    saveGoals(updatedGoals);
    
    // Reset form
    setNewGoal({
      id: "",
      title: "",
      description: "",
      deadline: undefined,
      progress: 0,
      category: "personal",
      steps: [],
      isPinned: false,
      isCompleted: false
    });
    setDate(undefined);
    setActiveTab("all");
    
    toast.success("Goal added successfully!");
  };

  const handleAddStep = () => {
    if (!newStep) return;
    
    setNewGoal({
      ...newGoal,
      steps: [
        ...newGoal.steps,
        {
          id: Date.now().toString(),
          description: newStep,
          isCompleted: false
        }
      ]
    });
    
    setNewStep("");
  };

  const handleRemoveStep = (stepId: string) => {
    setNewGoal({
      ...newGoal,
      steps: newGoal.steps.filter(step => step.id !== stepId)
    });
  };

  const handleTogglePin = (goalId: string) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, isPinned: !goal.isPinned } : goal
    );
    saveGoals(updatedGoals);
    toast.success("Goal updated");
  };

  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    saveGoals(updatedGoals);
    toast.success("Goal deleted");
  };

  const handleToggleStep = (goalId: string, stepId: string) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedSteps = goal.steps.map(step => 
          step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
        );
        
        // Calculate new progress
        const completedSteps = updatedSteps.filter(step => step.isCompleted).length;
        const totalSteps = updatedSteps.length;
        const newProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
        
        const isNowCompleted = newProgress === 100 && !goal.isCompleted;
        
        // Show reward if goal is now complete
        if (isNowCompleted) {
          setShowReward({show: true, category: goal.category});
          
          // Hide reward after 5 seconds
          setTimeout(() => {
            setShowReward(null);
          }, 5000);
        }
        
        return {
          ...goal,
          steps: updatedSteps,
          progress: newProgress,
          isCompleted: newProgress === 100
        };
      }
      return goal;
    });
    
    saveGoals(updatedGoals);
  };

  const filteredGoals = activeTab === "all" 
    ? goals 
    : goals.filter(goal => goal.category === activeTab);

  const pinnedGoals = filteredGoals.filter(goal => goal.isPinned);
  const unpinnedGoals = filteredGoals.filter(goal => !goal.isPinned);
  const sortedGoals = [...pinnedGoals, ...unpinnedGoals];

  const handleCategoryChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <PageLayout title="Goal Planner" icon={<Target className="h-5 w-5 mr-2" />} pageType="goals">
      <div className="space-y-6">
        <div className="mb-4">
          <Select value={activeTab} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Goals</SelectItem>
              {CATEGORIES.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reward Popup */}
        {showReward && (
          <Card className="p-4 sm:p-6 mb-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-2 border-yellow-400 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {REWARDS[showReward.category as keyof typeof REWARDS]?.icon || <Trophy className="h-6 w-6 text-yellow-500" />}
                <div className="ml-3">
                  <h3 className="text-lg font-bold">Goal Completed! 🎉</h3>
                  <p>{REWARDS[showReward.category as keyof typeof REWARDS]?.message || "Congratulations on achieving your goal!"}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowReward(null)}>
                Dismiss
              </Button>
            </div>
          </Card>
        )}

        {/* New Goal Form */}
        <Card className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
          <div className="mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-orange-500" />
            <h2 className="text-lg font-semibold">Create New Goal</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-title">Title</Label>
              <Input 
                id="goal-title"
                placeholder="Enter goal title" 
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="goal-description">Description</Label>
              <Textarea 
                id="goal-description"
                placeholder="Enter goal description" 
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="goal-category">Category</Label>
              <Select 
                value={newGoal.category}
                onValueChange={(value) => setNewGoal({...newGoal, category: value})}
              >
                <SelectTrigger id="goal-category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Steps</Label>
                <div className="text-xs text-gray-500">{newGoal.steps.length} step(s)</div>
              </div>
              
              <div className="space-y-2 mb-4">
                {newGoal.steps.map(step => (
                  <div key={step.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-sm">{step.description}</div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveStep(step.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a step" 
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddStep()}
                />
                <Button onClick={handleAddStep} type="button">
                  <PlusCircle className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
            
            <Button className="w-full" onClick={handleAddGoal}>
              Create Goal
            </Button>
          </div>
        </Card>
        
        {/* Goals List */}
        {sortedGoals.length > 0 ? (
          <div className="space-y-4">
            {sortedGoals.map(goal => (
              <Card key={goal.id} className={`p-4 ${goal.isPinned ? 'border-yellow-400 dark:border-yellow-600 border-2' : ''} ${goal.isCompleted ? 'border-green-400 dark:border-green-600 border-2' : ''} hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium">{goal.title}</h3>
                    {goal.isPinned && <Star className="h-4 w-4 text-yellow-500 ml-2" fill="currentColor" />}
                    {goal.isCompleted && <Award className="h-4 w-4 text-green-500 ml-2" fill="currentColor" />}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleTogglePin(goal.id)}
                      title={goal.isPinned ? "Unpin" : "Pin to top"}
                    >
                      <Star className={`h-4 w-4 ${goal.isPinned ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Delete goal"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                {goal.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{goal.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                    {CATEGORIES.find(c => c.id === goal.category)?.name || goal.category}
                  </span>
                  {goal.deadline && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-xs rounded-full flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {format(new Date(goal.deadline), "PP")}
                    </span>
                  )}
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
                
                {goal.steps.length > 0 && (
                  <div className="mt-3">
                    <details>
                      <summary className="cursor-pointer text-sm font-medium">
                        Steps ({goal.steps.filter(s => s.isCompleted).length}/{goal.steps.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {goal.steps.map(step => (
                          <div 
                            key={step.id} 
                            className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded cursor-pointer"
                            onClick={() => handleToggleStep(goal.id, step.id)}
                          >
                            <CheckSquare className={`h-4 w-4 ${step.isCompleted ? 'text-green-500 fill-green-500' : 'text-gray-400'}`} />
                            <span className={`text-sm ${step.isCompleted ? 'line-through text-gray-500' : ''}`}>
                              {step.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-2">No goals yet</h3>
            <p className="text-gray-500 mb-4">Start by creating your first goal</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Goals;


import * as React from "react";
import { ChevronLeft, ChevronRight, Dot } from "lucide-react";
import { DayPicker, DayContentProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  displaySticker?: (date: Date) => string | null;
};

// Create a custom interface that extends DayContentProps
interface ExtendedDayContentProps extends DayContentProps {
  displaySticker?: (date: Date) => string | null;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  displaySticker,
  ...props
}: CalendarProps) {
  const isMobile = useMobile();
  
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full max-w-full",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 py-1",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 sm:h-9 sm:w-9 rounded-full p-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-400/20 hover:bg-purple-500/30 text-purple-100 hover:text-white transition-all"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-purple-200 rounded-md font-normal text-[0.8rem] h-8 flex items-center justify-center",
          isMobile ? "w-8" : "w-10 sm:w-12"
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gradient-to-br [&:has([aria-selected])]:from-purple-900/40 [&:has([aria-selected])]:to-pink-900/40 rounded-lg border border-gray-700/50",
          isMobile ? "max-w-[2.5rem]" : ""
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "font-normal text-gray-100 aria-selected:opacity-100 hover:bg-gradient-to-br hover:from-purple-800/30 hover:to-pink-800/30 hover:text-white transition-all duration-200",
          isMobile ? "h-8 w-8 p-0 text-xs" : "h-8 w-8 sm:h-10 sm:w-10 p-0 text-sm" 
        ),
        day_selected:
          "bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:text-white focus:from-purple-700 focus:to-pink-700 focus:text-white shadow-lg shadow-purple-500/20",
        day_today: "bg-gradient-to-br from-purple-800/30 to-pink-800/30 text-white border border-purple-400/30",
        day_outside: "text-gray-500 opacity-50",
        day_disabled: "text-gray-500 opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        DayContent: (dayProps: ExtendedDayContentProps) => {
          // Extract date from props to show event indicator
          const date = dayProps.date;
          // Check if this date has the has_event modifier
          const hasEvent = dayProps.activeModifiers?.has_event || false;
          // Get emoji sticker if it exists for this date
          const sticker = displaySticker?.(date);
          
          return (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <span>{date.getDate()}</span>
              {sticker ? (
                <span className={`text-xs absolute bottom-0.5 left-1/2 transform -translate-x-1/2 ${isMobile ? 'text-[0.6rem]' : ''}`}>
                  {sticker}
                </span>
              ) : hasEvent && (
                <Dot className="h-2 w-2 text-purple-400 absolute bottom-0" />
              )}
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

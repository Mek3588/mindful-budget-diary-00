
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const isMobile = useMobile();
  
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 py-1",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 rounded-full p-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-400/20 hover:bg-purple-500/30 text-purple-100 hover:text-white transition-all"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-purple-200 rounded-md font-normal text-[0.9rem] h-10 flex items-center justify-center",
          isMobile ? "w-10" : "w-16"
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gradient-to-br [&:has([aria-selected])]:from-purple-900/40 [&:has([aria-selected])]:to-pink-900/40 rounded-lg border border-gray-700/50",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "font-normal text-gray-100 aria-selected:opacity-100 hover:bg-gradient-to-br hover:from-purple-800/30 hover:to-pink-800/30 hover:text-white transition-all duration-200",
          isMobile ? "h-10 w-10 p-0" : "h-16 w-16 p-0"
        ),
        day_selected:
          "bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:text-white focus:from-purple-700 focus:to-pink-700 focus:text-white shadow-lg shadow-purple-500/20",
        day_today: "bg-gradient-to-br from-purple-800/30 to-pink-800/30 text-white border border-purple-400/30",
        day_outside: "text-gray-500 opacity-50",
        day_disabled: "text-gray-500 opacity-50",
        day_range_middle:
          "aria-selected:bg-gradient-to-br aria-selected:from-purple-800/30 aria-selected:to-pink-800/30 aria-selected:text-gray-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

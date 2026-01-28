"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const navButtonClass =
  "h-8 w-8 bg-muted/50 p-0 opacity-50 hover:opacity-100 rounded-lg transition-all hover:bg-muted flex items-center justify-center z-10"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4 w-full",
        month_caption: "flex justify-center pt-1 relative items-center mb-6",
        caption_label: "text-xs font-semibold",
        nav: "flex items-center gap-1 absolute w-full justify-between px-2",
        button_previous: navButtonClass,
        button_next: navButtonClass,
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7 mb-4",
        weekday:
          "text-muted-foreground font-medium text-xs text-center",
        week: "grid grid-cols-7 w-full mt-1",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex items-center justify-center",
          props.mode === "range"
            ? "[&:has(.range-start)]:rounded-l-lg [&:has(.range-end)]:rounded-r-lg"
            : "[&:has([aria-selected])]:rounded-lg"
        ),
        day_button: cn(
          "h-9 w-full p-0 font-bold text-[10px] aria-selected:opacity-100 hover:bg-accent transition-all rounded-lg flex items-center justify-center"
        ),
        range_start:
          "range-start bg-primary text-background rounded-l-lg hover:bg-primary hover:text-background",
        range_end:
          "range-end bg-primary text-background rounded-r-lg hover:bg-primary hover:text-background",
        selected:
          "bg-primary text-background hover:bg-primary hover:text-background focus:bg-primary focus:text-background",
        today: "bg-accent text-foreground font-semibold",
        outside:
          "text-muted-foreground opacity-10 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-20",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-foreground rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...chevronProps} />
          ) : (
            <ChevronRight className="h-4 w-4" {...chevronProps} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

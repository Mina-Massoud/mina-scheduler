"use client";

// SchedulerContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";

import {
  Action,
  Event,
  Getters,
  Handlers,
  SchedulerContextType,
  startOfWeek,
} from "@/types/index";
import ModalProvider from "./modal-context";
// Define event and state types

interface SchedulerState {
  events: Event[];
}

// Define the variant options
export const variants = [
  "success",
  "primary",
  "default",
  "warning",
  "danger",
] as const;

// Reducer function
const schedulerReducer = (
  state: SchedulerState,
  action: Action
): SchedulerState => {
  switch (action.type) {
    case "ADD_EVENT":
      return { ...state, events: [...state.events, action.payload] };

    case "REMOVE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload.id),
      };
    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case "SET_EVENTS":
      return { ...state, events: action.payload };

    default:
      return state;
  }
};

// Create the context with the correct type
const SchedulerContext = createContext<SchedulerContextType | undefined>(
  undefined
);

// Provider component
export const SchedulerProvider = ({
  children,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  initialState,
  weekStartsOn = "sunday",
}: {
  onAddEvent?: (event: Event) => void;
  onUpdateEvent?: (event: Event) => void;
  onDeleteEvent?: (id: string) => void;
  weekStartsOn?: startOfWeek;
  children: ReactNode;
  initialState?: Event[];
}) => {
  const [state, dispatch] = useReducer(
    schedulerReducer,
    { events: initialState ?? [] } // Sets initialState or an empty array as the default
  );

  useEffect(() => {
    if (initialState) {
      dispatch({ type: "SET_EVENTS", payload: initialState });
    }
  }, [initialState]);

  // global getters
  const getDaysInMonth = (month: number, year: number) => {
    return Array.from(
      { length: new Date(year, month + 1, 0).getDate() },
      (_, index) => ({
        day: index + 1,
        events: [],
      })
    );
  };

  const getDaysInWeek = (week: number, year: number) => {
    // Determine if the week should start on Sunday (0) or Monday (1)
    const startDay = weekStartsOn === "sunday" ? 0 : 1;

    // Get January 1st of the year
    const janFirst = new Date(year, 0, 1);

    // Calculate how many days we are offsetting from January 1st
    const janFirstDayOfWeek = janFirst.getDay();

    // Calculate the start of the week by finding the correct day in the year
    const weekStart = new Date(janFirst);
    weekStart.setDate(
      janFirst.getDate() +
        (week - 1) * 7 +
        ((startDay - janFirstDayOfWeek + 7) % 7)
    );

    // Generate the week's days
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return weekNo;
  };

  // Helper function to filter events for a specific day
  const getEventsForDay = (day: number, currentDate: Date) => {
    return state?.events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // Create new Date objects to avoid mutating `currentDate`
      const startOfDay = new Date(currentDate);
      startOfDay.setDate(day);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDate);
      endOfDay.setDate(day + 1);
      endOfDay.setHours(0, 0, 0, 0);

      // Check if the event starts or spans across the given day
      const isSameDay =
        eventStart.getDate() === day &&
        eventStart.getMonth() === currentDate.getMonth() &&
        eventStart.getFullYear() === currentDate.getFullYear();

      const isSpanningDay = eventStart < endOfDay && eventEnd >= startOfDay;

      return isSameDay || isSpanningDay;
    });
  };

  const getDayName = (day: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[day];
  };

  const getters: Getters = {
    getDaysInMonth,
    getEventsForDay,
    getDaysInWeek,
    getWeekNumber,
    getDayName,
  };

  // handlers
  function handleEventStyling(
    event: Event, 
    dayEvents: Event[],
    periodOptions?: { 
      eventsInSamePeriod?: number; 
      periodIndex?: number; 
      adjustForPeriod?: boolean;
    }
  ) {
    // More precise time-based overlap detection
    const eventsOnHour = dayEvents.filter((e) => {
      // Don't compare with self
      if (e.id === event.id) return false;
      
      // Convert dates to timestamps for precise comparison
      const eStart = e.startDate instanceof Date ? e.startDate.getTime() : new Date(e.startDate).getTime();
      const eEnd = e.endDate instanceof Date ? e.endDate.getTime() : new Date(e.endDate).getTime();
      const eventStart = event.startDate instanceof Date ? event.startDate.getTime() : new Date(event.startDate).getTime();
      const eventEnd = event.endDate instanceof Date ? event.endDate.getTime() : new Date(event.endDate).getTime();
      
      // True overlap check - one event starts before the other ends
      return (eStart < eventEnd && eEnd > eventStart);
    });

    // Add the current event to the list of overlapping events
    const allEventsInRange = [event, ...eventsOnHour];

    // Sort overlapping events by start time to ensure consistent ordering
    allEventsInRange.sort((a, b) => {
      const aStart = a.startDate instanceof Date ? a.startDate.getTime() : new Date(a.startDate).getTime();
      const bStart = b.startDate instanceof Date ? b.startDate.getTime() : new Date(b.startDate).getTime();
      return aStart - bStart;
    });

    // Use custom period grouping if provided, otherwise use the precise overlapping events
    const useCustomPeriod = periodOptions?.adjustForPeriod && 
                           periodOptions.eventsInSamePeriod !== undefined && 
                           periodOptions.periodIndex !== undefined;
                           
    let numEventsOnHour = useCustomPeriod ? periodOptions!.eventsInSamePeriod! : allEventsInRange.length;
    let indexOnHour = useCustomPeriod ? periodOptions!.periodIndex! : allEventsInRange.indexOf(event);

    // If there are no overlapping events or using custom grouping failed, give full width
    if (numEventsOnHour === 0 || indexOnHour === -1) {
      numEventsOnHour = 1;
      indexOnHour = 0;
    }

    let eventHeight = 0;
    let maxHeight = 0;
    let eventTop = 0;

    if (event.startDate instanceof Date && event.endDate instanceof Date) {
      // Normalize start and end dates to only include hours and minutes
      const startTime =
        event.startDate.getHours() * 60 + event.startDate.getMinutes(); // Convert to minutes
      const endTime =
        event.endDate.getHours() * 60 + event.endDate.getMinutes(); // Convert to minutes

      // Calculate the difference in minutes between start and end times
      const diffInMinutes = endTime - startTime;

      // Calculate the event height based on the duration (64px per hour, so 64px/60min = 1.0667px per minute)
      eventHeight = (diffInMinutes / 60) * 64;

      // Get the event start hour as a fraction (e.g., 13.5 for 13:30)
      const eventStartHour =
        event.startDate.getHours() + event.startDate.getMinutes() / 60;

      // Define the day-end hour (24.0 for midnight)
      const dayEndHour = 24;

      // Calculate maxHeight based on the difference between the day-end hour and the event's start hour
      maxHeight = Math.max(0, (dayEndHour - eventStartHour) * 64);

      // Limit the event height to the calculated maxHeight (so it doesn't overflow beyond the day)
      eventHeight = Math.min(eventHeight, maxHeight);

      // Calculate the top position based on the event's start time (64px per hour)
      eventTop = eventStartHour * 64;
    } else {
      console.error("Invalid event or missing start/end dates.");
    }

    // Improved width and position calculation
    // Use a smaller width if we have multiple overlapping events
    const widthPercentage = Math.min(95 / Math.max(numEventsOnHour, 1), 95);
    
    // Calculate left position with a small gap between events
    const leftPosition = indexOnHour * (widthPercentage + 1);
    
    // Ensure left position doesn't go beyond container
    const safeLeftPosition = Math.min(leftPosition, 100 - widthPercentage);

    // Minimum height for visibility
    const minimumHeight = 20;

    return {
      height: `${
        eventHeight < minimumHeight
          ? minimumHeight
          : eventHeight > maxHeight
          ? maxHeight
          : eventHeight
      }px`,
      top: `${eventTop}px`,
      zIndex: indexOnHour + 1,
      left: `${safeLeftPosition}%`,
      maxWidth: `${widthPercentage}%`,
      minWidth: `${widthPercentage}%`,
    };
  }

  function handleAddEvent(event: Event) {
    dispatch({ type: "ADD_EVENT", payload: event });
    if (onAddEvent) {
      onAddEvent(event);
    }
  }

  function handleUpdateEvent(event: Event, id: string) {
    dispatch({ type: "UPDATE_EVENT", payload: { ...event, id } });
    if (onUpdateEvent) {
      onUpdateEvent(event);
    }
  }

  function handleDeleteEvent(id: string) {
    dispatch({ type: "REMOVE_EVENT", payload: { id } });
    if (onDeleteEvent) {
      onDeleteEvent(id);
    }
  }

  const handlers: Handlers = {
    handleEventStyling,
    handleAddEvent,
    handleUpdateEvent,
    handleDeleteEvent,
  };

  return (
    <SchedulerContext.Provider
      value={{ events: state, dispatch, getters, handlers, weekStartsOn }}
    >
      <ModalProvider>{children}</ModalProvider>
    </SchedulerContext.Provider>
  );
};

// Custom hook to use the scheduler context
export const useScheduler = () => {
  const context = useContext(SchedulerContext);
  if (!context) {
    throw new Error("useScheduler must be used within a SchedulerProvider");
  }
  return context;
};

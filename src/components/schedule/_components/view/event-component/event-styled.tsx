"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-context";
import AddEventModal from "@/components/schedule/_modals/add-event-modal";
import { Event, CustomEventModal } from "@/types";
import { TrashIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { useScheduler } from "@/providers/schedular-provider";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";

// Function to format date
const formatDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Function to format time only
const formatTime = (date: Date) => {
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Color variants based on event type
const variantColors = {
  primary: {
    bg: "bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-800",
  },
  danger: {
    bg: "bg-red-100",
    border: "border-red-200",
    text: "text-red-800",
  },
  success: {
    bg: "bg-green-100",
    border: "border-green-200",
    text: "text-green-800",
  },
  warning: {
    bg: "bg-yellow-100",
    border: "border-yellow-200",
    text: "text-yellow-800",
  },
};

interface EventStyledProps extends Event {
  minmized?: boolean;
  CustomEventComponent?: React.FC<Event>;
}

export default function EventStyled({
  event,
  onDelete,
  CustomEventModal,
}: {
  event: EventStyledProps;
  CustomEventModal?: CustomEventModal;
  onDelete?: (id: string) => void;
}) {
  const { setOpen } = useModal();
  const { handlers } = useScheduler();

  // Handler function
  function handleEditEvent(event: Event) {
    // Open the modal with the content
    setOpen(
      <CustomModal title="Edit Event">
        <AddEventModal
          CustomAddEventModal={
            CustomEventModal?.CustomAddEventModal?.CustomForm
          }
        />
      </CustomModal>,
      async () => {
        return {
          ...event,
        };
      }
    );
  }

  // Get background color class based on variant
  const getBackgroundColor = (variant: string | undefined) => {
    const variantKey = variant as keyof typeof variantColors || "primary";
    const colors = variantColors[variantKey] || variantColors.primary;
    return `${colors.bg} ${colors.text} ${colors.border}`;
  };

  return (
    <div
      key={event?.id}
      className={cn(
        "w-full z-50 relative cursor-pointer border group rounded-lg flex flex-col flex-grow shadow-sm hover:shadow-md transition-shadow duration-200",
        event?.minmized ? "border-transparent" : "border-default-400/60"
      )}
    >
      {/* Delete button - shown by default for non-minimized, or on hover for minimized */}
      <Button
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          handlers.handleDeleteEvent(event?.id);
          onDelete?.(event?.id);
        }}
        variant="destructive"
        size="icon"
        className={cn(
          "absolute z-[100] right-1 top-[-8px] h-6 w-6 p-0 shadow-md hover:bg-destructive/90 transition-all duration-200",
          event?.minmized ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}
      >
        <TrashIcon size={14} className="text-destructive-foreground" />
      </Button>

      {event.CustomEventComponent ? (
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            handleEditEvent({
              id: event?.id,
              title: event?.title,
              startDate: event?.startDate,
              endDate: event?.endDate,
              description: event?.description,
              variant: event?.variant,
            });
          }}
        >
          <event.CustomEventComponent {...event} />
        </div>
      ) : (
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            handleEditEvent({
              id: event?.id,
              title: event?.title,
              startDate: event?.startDate,
              endDate: event?.endDate,
              description: event?.description,
              variant: event?.variant,
            });
          }}
          className={cn(
            "w-full p-2 rounded",
            getBackgroundColor(event?.variant),
            event?.minmized ? "flex-grow overflow-hidden" : "min-h-fit"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="font-semibold text-xs truncate mb-1">
              {event?.title || "Untitled Event"}
            </div>
            
            {/* Show time in minimized mode */}
            {event?.minmized && (
              <div className="text-[10px] opacity-80">
                {formatTime(event?.startDate)}
              </div>
            )}
            
            {!event?.minmized && event?.description && (
              <div className="my-2 text-sm">{event?.description}</div>
            )}
            
            {!event?.minmized && (
              <div className="text-xs space-y-1 mt-2">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {formatDate(event?.startDate)}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="mr-1 h-3 w-3" />
                  {formatDate(event?.endDate)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

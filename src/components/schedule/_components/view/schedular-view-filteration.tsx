"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, CalendarDaysIcon } from "lucide-react";
import { BsCalendarMonth, BsCalendarWeek } from "react-icons/bs";

import AddEventModal from "../../_modals/add-event-modal";
import DailyView from "./day/daily-view";
import MonthView from "./month/month-view";
import WeeklyView from "./week/week-view";
import { useModal } from "@/providers/modal-context";
import { ClassNames, CustomComponents, Views } from "@/types/index";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";

// Animation settings for Framer Motion
const animationConfig = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, type: "spring", stiffness: 250 },
};

export default function SchedulerViewFilteration({
  views = {
    views: ["day", "week", "month"],
    mobileViews: ["day"],
  },
  stopDayEventSummary = false,
  CustomComponents,
  classNames,
}: {
  views?: Views;
  stopDayEventSummary?: boolean;
  CustomComponents?: CustomComponents;
  classNames?: ClassNames;
}) {
  const { setOpen } = useModal();
  const [clientSide, setClientSide] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Determine which views to show based on device
  const viewsSelector = isMobile ? views?.mobileViews : views?.views;
  
  // Initialize active view from the first available view
  const [activeView, setActiveView] = useState<string>(
    viewsSelector?.[0] || "day"
  );

  // Client-side initialization
  useEffect(() => {
    setClientSide(true);
    
    // Set initial mobile state
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    if (!clientSide) return;
    
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [clientSide]);

  // Handle view selection when mobile state changes
  useEffect(() => {
    if (viewsSelector && !viewsSelector.includes(activeView) && viewsSelector.length > 0) {
      setActiveView(viewsSelector[0]);
    }
  }, [viewsSelector, activeView]);

  // Open add event modal
  const handleAddEvent = () => {
    const modalTitle = CustomComponents?.CustomEventModal?.CustomAddEventModal?.title || "Add Event";
    const CustomForm = CustomComponents?.CustomEventModal?.CustomAddEventModal?.CustomForm;
    
    setOpen(
      <CustomModal title={modalTitle}>
        {CustomForm ? (
          <CustomForm
            register={{}}
            errors={{}}
          />
        ) : (
          <AddEventModal
            CustomAddEventModal={CustomForm}
          />
        )}
      </CustomModal>
    );
  };

  // Render view components
  const renderViewComponent = (view: string) => {
    const commonProps = {
      classNames: classNames?.buttons,
      prevButton: CustomComponents?.customButtons?.CustomPrevButton,
      nextButton: CustomComponents?.customButtons?.CustomNextButton,
      CustomEventComponent: CustomComponents?.CustomEventComponent,
      CustomEventModal: CustomComponents?.CustomEventModal,
    };

    switch (view) {
      case "day":
        return <DailyView stopDayEventSummary={stopDayEventSummary} {...commonProps} />;
      case "week":
        return <WeeklyView {...commonProps} />;
      case "month":
        return <MonthView {...commonProps} />;
      default:
        return null;
    }
  };

  // Render tab content
  const renderTabContent = (viewType: string) => (
    <TabsContent key={viewType} value={viewType}>
      <AnimatePresence mode="wait">
        <motion.div key={viewType} {...animationConfig}>
          {renderViewComponent(viewType)}
        </motion.div>
      </AnimatePresence>
    </TabsContent>
  );

  // Render tab trigger
  const renderTabTrigger = (viewType: string) => {
    let customIcon;
    let defaultIcon;
    let label;

    switch (viewType) {
      case "day":
        customIcon = CustomComponents?.customTabs?.CustomDayTab;
        defaultIcon = <CalendarDaysIcon size={15} />;
        label = "Day";
        break;
      case "week":
        customIcon = CustomComponents?.customTabs?.CustomWeekTab;
        defaultIcon = <BsCalendarWeek />;
        label = "Week";
        break;
      case "month":
        customIcon = CustomComponents?.customTabs?.CustomMonthTab;
        defaultIcon = <BsCalendarMonth />;
        label = "Month";
        break;
      default:
        return null;
    }

    return (
      <TabsTrigger key={viewType} value={viewType}>
        {customIcon ? (
          <div className="flex items-center space-x-2">
            {customIcon}
            <span>{label}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {defaultIcon}
            <span>{label}</span>
          </div>
        )}
      </TabsTrigger>
    );
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <div className="dayly-weekly-monthly-selection relative w-full">
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className={cn("w-full", classNames?.tabs)}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid grid-cols-3">
                {viewsSelector?.map(view => 
                  viewsSelector.includes(view) && renderTabTrigger(view)
                )}
              </TabsList>

              {/* Add Event Button */}
              {CustomComponents?.customButtons?.CustomAddEventButton ? (
                <div onClick={handleAddEvent}>
                  {CustomComponents?.customButtons.CustomAddEventButton}
                </div>
              ) : (
                <Button
                  onClick={handleAddEvent}
                  className={classNames?.buttons?.addEvent}
                  variant="default"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              )}
            </div>

            {viewsSelector?.map(view => 
              viewsSelector.includes(view) && renderTabContent(view)
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

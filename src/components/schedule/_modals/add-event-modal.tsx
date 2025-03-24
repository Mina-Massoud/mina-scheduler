"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useModal } from "@/providers/modal-context";
import SelectDate from "@/components/schedule/_components/add-event-components/select-date";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventFormData, eventSchema, Variant, Event } from "@/types/index";
import { useScheduler } from "@/providers/schedular-provider";
import { v4 as uuidv4 } from "uuid"; // Use UUID to generate event IDs

// Interface for modal data
interface ModalData {
  default?: Event;
  startDate?: Date;
  endDate?: Date;
  variant?: Variant;
  color?: string;
}

export default function AddEventModal({
  CustomAddEventModal,
}: {
  CustomAddEventModal?: React.FC<{ 
    register: Record<string, unknown>; 
    errors: Record<string, unknown>;
  }>;
}) {
  const { setClose, data } = useModal();
  const typedData = data as ModalData | undefined;

  // Ensure variant is a valid Variant type
  const getVariant = (): Variant => {
    if (typedData?.variant === "primary" || 
        typedData?.variant === "success" || 
        typedData?.variant === "danger" || 
        typedData?.variant === "warning" || 
        typedData?.variant === "default") {
      return typedData.variant;
    }
    return "primary"; // Default fallback
  };

  const [selectedColor, setSelectedColor] = useState<string>(
    getEventColor(getVariant())
  );

  const { handlers } = useScheduler();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      variant: getVariant(),
      color: typedData?.color || "blue",
    },
  });

  // Reset the form on initialization
  useEffect(() => {
    if (typedData?.default) {
      const eventData = typedData.default;
      reset({
        title: eventData.title,
        description: eventData.description || "",
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        variant: eventData.variant || "primary",
        color: selectedColor,
      });
    }
  }, [typedData, reset, selectedColor]);

  const colorOptions = [
    { key: "blue", name: "Blue" },
    { key: "red", name: "Red" },
    { key: "green", name: "Green" },
    { key: "yellow", name: "Yellow" },
  ];

  function getEventColor(variant: Variant) {
    switch (variant) {
      case "primary":
        return "blue";
      case "danger":
        return "red";
      case "success":
        return "green";
      case "warning":
        return "yellow";
      default:
        return "blue";
    }
  }

  function getEventStatus(color: string) {
    switch (color) {
      case "blue":
        return "primary";
      case "red":
        return "danger";
      case "green":
        return "success";
      case "yellow":
        return "warning";
      default:
        return "default";
    }
  }

  const getButtonVariant = (color: string) => {
    switch (color) {
      case "blue":
        return "default";
      case "red":
        return "destructive";
      case "green":
        return "success";
      case "yellow":
        return "warning";
      default:
        return "default";
    }
  };

  const onSubmit: SubmitHandler<EventFormData> = (formData) => {
    const newEvent: Event = {
      id: uuidv4(), // Generate a unique ID
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
      variant: formData.variant,
      description: formData.description,
    };

    if (!typedData?.default?.id) handlers.handleAddEvent(newEvent);
    else handlers.handleUpdateEvent(newEvent, typedData.default.id);
    setClose(); // Close the modal after submission
  };

  return (
    <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
      {CustomAddEventModal ? (
        <CustomAddEventModal 
          register={register as unknown as Record<string, unknown>}
          errors={errors as unknown as Record<string, unknown>}
        />
      ) : (
        <>
          <div className="grid gap-2">
            <Label htmlFor="title">Event Name</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter event name"
              className={cn(errors.title && "border-red-500")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">
                {errors.title.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter event description"
            />
          </div>

          <SelectDate
            data={{
              startDate: typedData?.default?.startDate || new Date(),
              endDate: typedData?.default?.endDate || new Date(),
            }}
            setValue={setValue}
          />

          <div className="grid gap-2">
            <Label>Color</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={getButtonVariant(selectedColor)}
                  className="w-fit my-2"
                >
                  {
                    colorOptions.find((color) => color.key === selectedColor)
                      ?.name
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {colorOptions.map((color) => (
                  <DropdownMenuItem
                    key={color.key}
                    onClick={() => {
                      setSelectedColor(color.key);
                      setValue("variant", getEventStatus(color.key));
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        style={{
                          backgroundColor: `var(--${color.key})`,
                        }}
                        className={`w-4 h-4 rounded-full mr-2`}
                      />
                      {color.name}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex justify-end space-x-2 mt-4 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setClose()}>
              Cancel
            </Button>
            <Button type="submit">Save Event</Button>
          </div>
        </>
      )}
    </form>
  );
}

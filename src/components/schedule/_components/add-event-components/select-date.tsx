"use client";

import { EventFormData } from "@/types";
import React, { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { format, setHours, setMinutes, isBefore } from "date-fns";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SelectDate({
  data,
  setValue,
}: {
  data?: { startDate: Date; endDate: Date };
  setValue: UseFormSetValue<EventFormData>;
}) {

  console.log("data", data);
  const [startDate, setStartDate] = useState<Date>(
    data?.startDate instanceof Date ? data.startDate : new Date()
  );
  
  const [endDate, setEndDate] = useState<Date>(
    data?.endDate instanceof Date ? data.endDate : new Date()
  );
  
  // Update state when data changes
  useEffect(() => {
    if (data?.startDate instanceof Date) {
      setStartDate(data.startDate);
    }
    if (data?.endDate instanceof Date) {
      setEndDate(data.endDate);
    }
  }, [data]);
  
  // Update form values when dates change
  useEffect(() => {
    setValue("startDate", startDate);
    
    // Ensure end date is not before start date
    if (isBefore(endDate, startDate)) {
      const newEndDate = new Date(startDate);
      newEndDate.setHours(startDate.getHours() + 1);
      setEndDate(newEndDate);
      setValue("endDate", newEndDate);
    } else {
      setValue("endDate", endDate);
    }
  }, [startDate, endDate, setValue]);

  // Time options for select
  const hours = Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ["AM", "PM"];

  // Convert 24-hour format to 12-hour format
  const get12HourFormat = (hour: number) => {
    return hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  };

  // Get period (AM/PM) from hour
  const getPeriod = (hour: number) => {
    return hour >= 12 ? "PM" : "AM";
  };

  // Convert 12-hour format to 24-hour format
  const get24HourFormat = (hour: number, period: string) => {
    if (period === "AM") {
      return hour === 12 ? 0 : hour;
    } else {
      return hour === 12 ? 12 : hour + 12;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  if (date) {
                    // Preserve the time when changing the date
                    const newDate = new Date(date);
                    newDate.setHours(
                      startDate.getHours(),
                      startDate.getMinutes(),
                      0,
                      0
                    );
                    setStartDate(newDate);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="endDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  if (date) {
                    // Preserve the time when changing the date
                    const newDate = new Date(date);
                    newDate.setHours(
                      endDate.getHours(),
                      endDate.getMinutes(),
                      0,
                      0
                    );
                    setEndDate(newDate);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Start Time */}
        <div className="space-y-2">
          <Label>Start Time</Label>
          <div className="flex space-x-2">
            <Select
              value={get12HourFormat(startDate.getHours()).toString()}
              onValueChange={(value) => {
                const hour = parseInt(value, 10);
                const period = getPeriod(startDate.getHours());
                const newHour = get24HourFormat(hour, period);
                const newDate = setHours(startDate, newHour);
                setStartDate(newDate);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent className="h-[200px]">
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {hour.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={startDate.getMinutes().toString()}
              onValueChange={(value) => {
                const newDate = setMinutes(startDate, parseInt(value, 10));
                setStartDate(newDate);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent className="h-[200px]">
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute.toString()}>
                    {minute.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={getPeriod(startDate.getHours())}
              onValueChange={(value) => {
                const hour = get12HourFormat(startDate.getHours());
                const newHour = get24HourFormat(hour, value);
                const newDate = setHours(startDate, newHour);
                setStartDate(newDate);
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground">
            Current time: {format(startDate, "hh:mm a")}
          </div>
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <Label>End Time</Label>
          <div className="flex space-x-2">
            <Select
              value={get12HourFormat(endDate.getHours()).toString()}
              onValueChange={(value) => {
                const hour = parseInt(value, 10);
                const period = getPeriod(endDate.getHours());
                const newHour = get24HourFormat(hour, period);
                const newDate = setHours(endDate, newHour);
                setEndDate(newDate);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent className="h-[200px]">
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {hour.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={endDate.getMinutes().toString()}
              onValueChange={(value) => {
                const newDate = setMinutes(endDate, parseInt(value, 10));
                setEndDate(newDate);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent className="h-[200px]">
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute.toString()}>
                    {minute.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={getPeriod(endDate.getHours())}
              onValueChange={(value) => {
                const hour = get12HourFormat(endDate.getHours());
                const newHour = get24HourFormat(hour, value);
                const newDate = setHours(endDate, newHour);
                setEndDate(newDate);
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground">
            Current time: {format(endDate, "hh:mm a")}
          </div>
        </div>
      </div>
    </div>
  );
}

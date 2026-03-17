"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { getRecurrenceDescription, type RecurrencePattern } from "@/lib/task-utils"

interface RecurrenceFormProps {
  value?: RecurrencePattern
  onChange: (pattern: RecurrencePattern) => void
  trigger?: React.ReactNode
}

export function RecurrenceForm({
  value = { type: "none" },
  onChange,
  trigger,
}: RecurrenceFormProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<RecurrencePattern["type"]>(value.type || "none")
  const [interval, setInterval] = useState(value.interval || 1)
  const [dayOfMonth, setDayOfMonth] = useState(value.dayOfMonth || 1)

  const handleSave = () => {
    const pattern: RecurrencePattern = {
      type,
      ...(type === "custom" && { interval: Math.max(1, interval) }),
      ...(type === "monthly" && { dayOfMonth }),
    }
    onChange(pattern)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <Icons.repeat className="w-4 h-4" />
            {getRecurrenceDescription(value)}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Recurrence</DialogTitle>
          <DialogDescription>
            Choose how often this task should repeat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Recurrence Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="recurrence-type" className="text-sm font-medium">
              Recurrence Pattern
            </Label>
            <Select value={type} onValueChange={(t) => setType(t as RecurrencePattern["type"])}>
              <SelectTrigger id="recurrence-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Recurrence</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Every Two Weeks</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Interval */}
          {type === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="interval" className="text-sm font-medium">
                Every (days)
              </Label>
              <Input
                id="interval"
                type="number"
                min="1"
                max="365"
                value={interval}
                onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-9"
              />
            </div>
          )}

          {/* Monthly Day Selection */}
          {type === "monthly" && (
            <div className="space-y-2">
              <Label htmlFor="day-of-month" className="text-sm font-medium">
                Day of Month
              </Label>
              <Select value={dayOfMonth.toString()} onValueChange={(v) => setDayOfMonth(parseInt(v))}>
                <SelectTrigger id="day-of-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preview Card */}
          <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 p-3">
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              <span className="font-semibold">Preview:</span> {getRecurrenceDescription({ type } as RecurrencePattern)}
            </p>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Save Pattern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

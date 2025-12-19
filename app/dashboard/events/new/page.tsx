'use client'

import { createEvent } from "@/app/actions/events"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState } from "react"

export default function CreateEventPage() {
    const initialState = { message: null, errors: {} };
    // @ts-ignore
    const [state, dispatch] = useActionState(createEvent, initialState);

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
            <form action={dispatch} className="space-y-6 border p-6 rounded-lg bg-card">
                <div className="space-y-2">
                    <Label htmlFor="name">Event Name</Label>
                    <Input id="name" name="name" placeholder="e.g. Annual Hackathon 2024" required />
                    {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL Identifier)</Label>
                    <Input id="slug" name="slug" placeholder="e.g. hackathon-2024" required />
                    <p className="text-xs text-muted-foreground">Used for public links.</p>
                    {state?.errors?.slug && <p className="text-sm text-red-500">{state.errors.slug}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" name="startDate" type="date" required />
                        {state?.errors?.startDate && <p className="text-sm text-red-500">{state.errors.startDate}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">End Date (Optional)</Label>
                        <Input id="endDate" name="endDate" type="date" />
                    </div>
                </div>

                <div className="pt-4">
                    {state?.message && <p className="text-sm text-red-500 mb-2">{state.message}</p>}
                    <Button type="submit">Create Event</Button>
                </div>
            </form>
        </div>
    )
}

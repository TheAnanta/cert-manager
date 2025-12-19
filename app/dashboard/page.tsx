
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

export default async function DashboardPage() {
    const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { participants: true, templates: true } } }
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Recent Events</h2>
                <Link href="/dashboard/events/new">
                    <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Event
                        </span>
                    </Button>
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">You have no events</h3>
                        <p className="text-sm text-muted-foreground">
                            Get started by creating your first event.
                        </p>
                        <Link href="/dashboard/events/new" className="mt-4">
                            <Button>Add Event</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <CardTitle>{event.name}</CardTitle>
                                    <CardDescription>
                                        {format(event.startDate, 'MMM d, yyyy')}
                                        {event.endDate && ` - ${format(event.endDate, 'MMM d, yyyy')}`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground">
                                        {event._count.participants} Participants • {event._count.templates} Templates
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}


import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

export default async function EventsListPage() {
    const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { participants: true, templates: true } } }
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">All Events</h2>
                <Link href="/dashboard/events/new">
                    <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add Event
                    </Button>
                </Link>
            </div>

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
                {events.length === 0 && (
                    <p className="col-span-3 text-muted-foreground text-center py-10">No events found.</p>
                )}
            </div>
        </div>
    )
}

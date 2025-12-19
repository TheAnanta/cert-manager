
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { Stamp, Download } from "lucide-react"
import Link from "next/link"
import { AddParticipantForm } from "./add-participant-form"
import { GenerateButton } from "./generate-button"
import { TemplateList } from "./template-list"
import { RevokeButton } from "./revoke-button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id: id },
        include: {
            participants: {
                include: { certificate: true },
                orderBy: { name: 'asc' }
            },
            templates: true,
            _count: { select: { participants: true, templates: true } }
        }
    })

    if (!event) return <div>Event not found</div>

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{(event as any).name}</h2>
                    <p className="text-muted-foreground">
                        {format((event as any).startDate, 'MMMM d, yyyy')}
                        {(event as any).endDate && ` - ${format((event as any).endDate, 'MMMM d, yyyy')}`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/events/${event.id}/design`}>
                        <Button variant="outline" className="gap-2">
                            <Stamp className="h-4 w-4" />
                            Design Template
                        </Button>
                    </Link>
                    <Link href={`/dashboard/events/${event.id}/drafts`}>
                        <Button variant="outline" className="gap-2">
                            Manage Pre-drafts
                        </Button>
                    </Link>
                    <GenerateButton eventId={event.id} templates={event.templates} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded-lg p-6 bg-card">
                    <h3 className="font-semibold text-lg">Participants</h3>
                    <p className="text-3xl font-bold">{event._count.participants}</p>
                </div>
                <div className="border rounded-lg p-6 bg-card">
                    <h3 className="font-semibold text-lg">Templates</h3>
                    <p className="text-3xl font-bold">{event._count.templates}</p>
                </div>
                <div className="border rounded-lg p-6 bg-card flex flex-col justify-center gap-2">
                    <AddParticipantForm eventId={event.id} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xl">Templates</h3>
                </div>
                <TemplateList eventId={event.id} templates={event.templates} />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Certificate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {event.participants.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.email}</TableCell>
                                <TableCell>{p.category}</TableCell>
                                <TableCell>
                                    {p.certificate ? (
                                        <div className="flex items-center gap-2">
                                            <Link href={`/verify?id=${p.certificate.id}`} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                                                View <Download className="h-3 w-3" />
                                            </Link>
                                            <RevokeButton certificateId={p.certificate.id} eventId={event.id} />
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Not Generated</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {event.participants.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                    No participants yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

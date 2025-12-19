import { prisma } from "@/lib/prisma"
import { Link } from "lucide-react"
import NextLink from "next/link"
import { Button } from "@/components/ui/button"
import { CreateDraftForm } from "./create-draft-form"
import { AssignDraftDialog } from "./assign-draft-dialog"

export default async function DraftsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch event and active template
    const event = await prisma.event.findUnique({
        where: { id },
        include: { templates: true }
    });

    if (!event) return <div>Event not found</div>;

    if (event.templates.length === 0) return <div className="p-8 text-center">No template found for this event. Please design a template first.</div>

    // If we want to show drafts for ALL templates, we just remove the filter or filter by first?
    // Let's filter by the first one or allow filtering? 
    // For simplicity, showing ALL drafts for this event seems better, but the query was specific.
    // Let's show drafts for ALL templates of this event.
    const drafts = await prisma.certificate.findMany({
        where: {
            template: { eventId: id },
            participantId: null
        },
        include: { template: true }, // Include template info to show which one
        orderBy: { issuedAt: 'desc' }
    });

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <NextLink href={`/dashboard/events/${id}`} className="hover:underline">Back to Event</NextLink>
                    <span>/</span>
                    <span>Drafts</span>
                </div>
                <h1 className="text-3xl font-bold">Manage Draft Certificates</h1>
                <p className="text-muted-foreground">Create certificates with custom IDs and assign them later.</p>
            </div>

            <CreateDraftForm eventId={id} templates={event.templates} />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Pre-drafted Certificates ({drafts.length})</h2>
                <div className="border rounded-md">
                    {drafts.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No drafts created yet.</div>
                    ) : (
                        <div className="divide-y">
                            {drafts.map((draft) => (
                                <div key={draft.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="font-mono bg-muted px-2 py-1 rounded text-sm">{draft.id}</div>
                                        {/* Link to verify/view */}
                                        <NextLink href={`/verify?id=${draft.id}`} target="_blank" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                            View <Link className="h-3 w-3" />
                                        </NextLink>
                                    </div>
                                    <div className="flex gap-2">
                                        <AssignDraftDialog certificateId={draft.id} eventId={id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

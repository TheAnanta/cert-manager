import { ClientDesignWrapper } from "./client-wrapper";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTemplates } from "@/app/actions/templates";

export default async function DesignPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ templateId?: string }> }) {
  const { id } = await params;
  const { templateId } = await searchParams;
  const images = await getTemplates();

  let existingTemplate = null;
  if (templateId) {
    existingTemplate = await prisma.certificateTemplate.findUnique({
      where: { id: templateId }
    });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    select: { name: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/events/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to {event?.name || 'Event'}
        </Link>
        <h1 className="text-2xl font-bold">{existingTemplate ? 'Edit Template' : 'Design Certificate'}</h1>
        <p className="text-muted-foreground">Select a template and position the placeholders.</p>
      </div>

      <ClientDesignWrapper eventId={id} images={images} initialTemplate={existingTemplate} />
    </div>
  );
}

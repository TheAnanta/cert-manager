'use client'

import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { deleteTemplate } from "@/app/actions/templates"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function TemplateList({ eventId, templates }: { eventId: string, templates: any[] }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        startTransition(async () => {
            const res = await deleteTemplate(id, eventId);
            if (res.error) alert(res.error);
        });
    }

    if (templates.length === 0) return <div className="text-muted-foreground p-6 border rounded-lg text-center">No templates designed yet.</div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
                <div key={template.id} className="border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
                    <div className="aspect-video bg-muted relative">
                        <img src={template.imageUrl} className="w-full h-full object-cover" alt="Template" />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                        <span className="font-medium truncate">{template.name || 'Untitled'}</span>
                        <div className="flex gap-2">
                            <Link href={`/dashboard/events/${eventId}/design?templateId=${template.id}`}>
                                <Button size="icon" variant="ghost" title="Edit Design">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(template.id)} disabled={isPending}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

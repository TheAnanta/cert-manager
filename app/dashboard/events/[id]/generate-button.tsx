'use client'

import { generateCertificates } from "@/app/actions/participants"
import { Button } from "@/components/ui/button"
import { Wand2, Loader2, Play } from "lucide-react"
import { useState, useTransition } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function GenerateButton({ eventId, templates }: { eventId: string, templates: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');

    const handleGenerate = () => {
        if (!selectedTemplate && templates.length > 0) {
            // Default to first if not selected
            // Better to force select or default on mount?
        }

        const targetId = selectedTemplate || templates[0]?.id;
        if (!targetId) return;

        startTransition(async () => {
            const result = await generateCertificates(eventId, targetId);
            alert(result.message); // Simple feedback for now
            setOpen(false);
        });
    };

    if (templates.length === 0) {
        return <Button disabled variant="outline">No Templates</Button>
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Wand2 className="h-4 w-4" />
                    Generate Certificates
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generate Certificates</DialogTitle>
                    <DialogDescription>
                        Choose a template to generate certificates for all unassigned participants.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Select Template</Label>
                        <Select onValueChange={setSelectedTemplate} defaultValue={templates[0]?.id}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map(t => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.name || 'Untitled Template'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleGenerate} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                        Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

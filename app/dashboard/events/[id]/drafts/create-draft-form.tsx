'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createDraft } from '@/app/actions/drafts'
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CreateDraftForm({ eventId, templates }: { eventId: string, templates: any[] }) {
    const [customId, setCustomId] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState<string>(templates[0]?.id || '')

    const handleCreate = async () => {
        if (!selectedTemplate) {
            setMessage('Please select a template');
            return;
        }
        setLoading(true)
        setMessage('')
        const res = await createDraft(eventId, selectedTemplate, customId || undefined)
        setLoading(false)
        if (res?.error) {
            setMessage(res.error)
        } else {
            setMessage('Draft created!')
            setCustomId('')
        }
    }

    const generateRandomId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCustomId('CERT-' + result);
    }

    if (templates.length === 0) return <div className="text-red-500">No templates available. Please design one first.</div>;

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
            <h3 className="font-semibold">Create Draft Certificate</h3>
            <div className="flex flex-col gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Select Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Template" />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.name || 'Untitled'}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-4 items-end">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="customId">Certificate ID (Optional)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="customId"
                                placeholder="e.g. CERT-2024-001"
                                value={customId}
                                onChange={(e) => setCustomId(e.target.value)}
                            />
                            <Button variant="outline" onClick={generateRandomId} type="button" title="Generate Random ID">
                                Auto
                            </Button>
                        </div>
                    </div>
                    <Button onClick={handleCreate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Draft
                    </Button>
                </div>
            </div>
            {message && <p className={`text-sm ${message.includes('error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
        </div>
    )
}

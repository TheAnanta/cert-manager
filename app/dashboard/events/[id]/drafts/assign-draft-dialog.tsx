'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { assignDraft } from '@/app/actions/drafts'
import { Loader2, UserPlus } from 'lucide-react'

export function AssignDraftDialog({ certificateId, eventId, trigger }: { certificateId: string, eventId: string, trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [category, setCategory] = useState('')
    const [loading, setLoading] = useState(false)

    const handleAssign = async () => {
        setLoading(true)
        await assignDraft(certificateId, eventId, { name, email, category })
        setLoading(false)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-2" /> Assign</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Certificate {certificateId}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Participant Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="General" />
                    </div>
                    <Button onClick={handleAssign} disabled={loading || !name || !email} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assign Participant
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

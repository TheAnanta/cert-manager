'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { revokeCertificate } from "@/app/actions/revoke-certificate"
import { useRouter } from "next/navigation"

export function RevokeButton({ certificateId, eventId }: { certificateId: string, eventId: string }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleRevoke = async () => {
        if (!confirm("Are you sure you want to revoke this certificate? This will delete the certificate record.")) {
            return
        }

        startTransition(async () => {
            const result = await revokeCertificate(certificateId, eventId)
            if (result.error) {
                alert(result.error)
            } else {
                router.refresh()
            }
        })
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleRevoke}
            disabled={isPending}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1 h-8 px-2"
            title="Revoke Certificate"
        >
            {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <Trash2 className="h-3 w-3" />
            )}
            Revoke
        </Button>
    )
}

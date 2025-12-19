'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function revokeCertificate(certificateId: string, eventId: string) {
    try {
        await prisma.certificate.delete({
            where: { id: certificateId }
        })

        revalidatePath(`/dashboard/events/${eventId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to revoke certificate:", error)
        return { error: "Failed to revoke certificate" }
    }
}

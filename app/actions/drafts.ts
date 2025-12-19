'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createDraft(eventId: string, templateId: string, customId?: string) {
    // 1. Check if custom ID is provided and unique
    if (customId) {
        const existing = await prisma.certificate.findUnique({
            where: { id: customId }
        });
        if (existing) {
            return { error: "Certificate ID already exists." };
        }
    }

    try {
        await prisma.certificate.create({
            data: {
                id: customId || undefined,
                templateId,
            } as any
        });
    } catch (e) {
        return { error: "Failed to create draft certificate." };
    }

    revalidatePath(`/dashboard/events/${eventId}/drafts`);
}

export async function assignDraft(certificateId: string, eventId: string, data: { name: string; email: string; category?: string }) {
    // 1. Create Participant
    const participant = await prisma.participant.create({
        data: {
            eventId,
            name: data.name,
            email: data.email,
            category: data.category || 'General'
        }
    });

    // 2. Assign to Certificate
    await prisma.certificate.update({
        where: { id: certificateId },
        data: {
            participantId: participant.id
        }
    });

    revalidatePath(`/dashboard/events/${eventId}/drafts`);
    revalidatePath(`/dashboard/events/${eventId}`);
}

// Bulk generate unassigned certificates if needed?
// User asked to create *one* or *pre-drafted* certs.
// I'll stick to single creation for now or simple form.

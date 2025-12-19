'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const participantSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    category: z.string().optional(),
})

export async function addParticipant(eventId: string, prevState: any, formData: FormData) {
    const validated = participantSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        category: formData.get('category')
    })

    if (!validated.success) {
        return { message: "Validation error", errors: validated.error.flatten().fieldErrors }
    }

    try {
        await prisma.participant.create({
            data: {
                eventId,
                name: validated.data.name,
                email: validated.data.email,
                category: validated.data.category || "General"
            }
        })
    } catch (e) {
        return { message: "Failed to add participant" }
    }

    revalidatePath(`/dashboard/events/${eventId}`)
    return { message: "Participant added", success: true }
}

export async function generateCertificates(eventId: string, templateId?: string) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { templates: true, participants: { include: { certificate: true } } }
    })

    if (!event || event.templates.length === 0) {
        return { message: "No templates found for this event." }
    }

    // Use provided templateId or fallback to the first one (for backward compat if needed, though UI should enforce)
    const template = templateId
        ? event.templates.find(t => t.id === templateId)
        : event.templates[0]

    if (!template) {
        return { message: "Selected template not found." }
    }

    // Filter participants who don't have a certificate FOR THIS TEMPLATE? 
    // Usually one cert per event. But if multiple templates, maybe different categories?
    // Current schema: Participant has `certificate: Certificate?`. One-to-one relationship on Participant side?
    // Let's check schema via code provided earlier or memory. 
    // `participants: { include: { certificate: true } }` implies One-to-One or One-to-Many?
    // If Participant has `certificate` relation, usually it's one.
    // So if they have ANY certificate for this event, we skip?
    // Assuming 1 cert per participant per event.

    const participants = event.participants.filter(p => !p.certificate)

    if (participants.length === 0) {
        return { message: "All participants already have certificates." }
    }

    let count = 0
    for (const p of participants) {
        await prisma.certificate.create({
            data: {
                participantId: p.id,
                templateId: template.id
            }
        })
        count++
    }

    revalidatePath(`/dashboard/events/${eventId}`)
    return { message: `Generated ${count} certificates using template '${template.name || 'Untitled'}'.` }
}

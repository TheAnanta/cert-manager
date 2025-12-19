'use server'

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const eventSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters"),
    startDate: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: "A valid start date is required.",
    }),
    endDate: z.string().optional(),
})

export async function createEvent(prevState: any, formData: FormData) {
    const validatedFields = eventSchema.safeParse({
        name: formData.get('name'),
        slug: formData.get('slug'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate') || undefined,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Event.',
        }
    }

    const { name, slug, startDate, endDate } = validatedFields.data

    try {
        await prisma.event.create({
            data: {
                name,
                slug,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
            },
        })
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Event. Slug might be taken.',
        }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

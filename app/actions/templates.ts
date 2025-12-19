'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import fs from "fs";
import path from "path";
import { adminStorage } from "@/lib/firebase-admin";

export async function deleteTemplate(templateId: string, eventId: string) {
    try {
        await prisma.certificateTemplate.delete({ where: { id: templateId } });
        revalidatePath(`/dashboard/events/${eventId}`);
        return { success: true, message: 'Template deleted successfully' };
    } catch (error) {
        return { error: 'Failed to delete template' };
    }
}

export async function saveTemplate(eventId: string, imageUrl: string, placeholders: any, templateId?: string) {
    try {
        if (templateId) {
            await prisma.certificateTemplate.update({
                where: { id: templateId },
                data: {
                    imageUrl,
                    placeholders: JSON.stringify(placeholders)
                }
            });
        } else {
            await prisma.certificateTemplate.create({
                data: {
                    eventId,
                    name: 'Certificate Template',
                    imageUrl,
                    placeholders: JSON.stringify(placeholders)
                }
            })
        }
        revalidatePath(`/dashboard/events/${eventId}`);
        return { success: true, message: 'Template saved successfully' };
    } catch (error) {
        return { error: 'Failed to save template' };
    }
}

export async function getTemplates() {
    const localTemplatesDir = path.join(process.cwd(), "public/templates");
    const localImages: string[] = [];

    // Local files
    try {
        const files = await fs.promises.readdir(localTemplatesDir);
        localImages.push(...files.filter(file => /\.(png|jpg|jpeg|svg)$/i.test(file)).map(file => `/templates/${file}`));
    } catch (error) {
        console.error("Local templates err:", error);
    }

    // Cloud files (Firebase Storage)
    const cloudImages: string[] = [];
    try {
        const [files] = await adminStorage.bucket().getFiles({ prefix: 'templates/' });
        for (const file of files) {
            // Get signed URL for the image
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491', // Long term or dynamic
            });
            cloudImages.push(url);
        }
    } catch (error) {
        console.error("Cloud templates err:", error);
    }

    return [...localImages, ...cloudImages];
}

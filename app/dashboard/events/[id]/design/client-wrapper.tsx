'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CertificateDesigner } from "@/app/components/CertificateDesigner";
import { saveTemplate } from "@/app/actions/templates";

export function ClientDesignWrapper({ eventId, images, initialTemplate }: { eventId: string, images: string[], initialTemplate?: any }) {
    const [selectedImage, setSelectedImage] = useState<string | null>(initialTemplate?.imageUrl || null);

    // Parse placeholders if editing, ensure valid JSON
    const initialPlaceholders = initialTemplate?.placeholders
        ? (typeof initialTemplate.placeholders === 'string'
            ? JSON.parse(initialTemplate.placeholders)
            : initialTemplate.placeholders)
        : [];

    const handleSave = async (placeholders: any) => {
        if (!selectedImage) return;

        if (initialTemplate) {
            // Update existing
            await saveTemplate(eventId, selectedImage, placeholders, initialTemplate.id);
        } else {
            // Create new
            await saveTemplate(eventId, selectedImage, placeholders);
        }
    };

    if (selectedImage) {
        return (
            <div className="space-y-4">
                {!initialTemplate && <Button variant="ghost" onClick={() => setSelectedImage(null)}>← Back to Selection</Button>}
                <CertificateDesigner
                    imageUrl={selectedImage}
                    onSave={handleSave}
                    initialPlaceholders={initialPlaceholders}
                />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img) => (
                <div key={img} className="border rounded-lg p-2 cursor-pointer hover:border-primary transition-all group" onClick={() => setSelectedImage(img)}>
                    <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                        <img src={img} alt="Template" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                    </div>
                    <div className="mt-2 text-center text-sm font-medium">Select this template</div>
                </div>
            ))}

            {images.length === 0 && <p className="col-span-3 text-muted-foreground">No templates found in public/templates. Please upload images to the server's public/templates folder.</p>}
        </div>
    )
}

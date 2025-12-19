'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { useState } from 'react'

export function DownloadButtons({ targetId, certificateId }: { targetId: string, certificateId: string }) {
    const [downloading, setDownloading] = useState(false)

    const downloadPNG = async () => {
        const element = document.getElementById(targetId)
        if (!element) return

        setDownloading(true)
        try {
            const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2 })
            const link = document.createElement('a')
            link.download = `certificate-${certificateId}.png`
            link.href = dataUrl
            link.click()
        } catch (err) {
            console.error(err)
            alert('Failed to generate PNG')
        }
        setDownloading(false)
    }

    const downloadPDF = async () => {
        const element = document.getElementById(targetId)
        if (!element) return

        setDownloading(true)
        try {
            const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2 })
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [element.offsetWidth, element.offsetHeight] // Match component size
                // Or standard A4: format: 'a4'
            })

            // Scaled to fit if using standard format, or custom size
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`certificate-${certificateId}.pdf`)
        } catch (err) {
            console.error(err)
            alert('Failed to generate PDF')
        }
        setDownloading(false)
    }

    return (
        <div className="flex gap-2">
            <Button onClick={downloadPNG} disabled={downloading} variant="secondary">
                <Download className="mr-2 h-4 w-4" /> PNG
            </Button>
            <Button onClick={downloadPDF} disabled={downloading} variant="secondary">
                <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
        </div>
    )
}

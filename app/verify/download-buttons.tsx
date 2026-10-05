'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { useState } from 'react'

export function DownloadButtons({ targetId, certificateId, unscaledHeight = 565, naturalWidth = 800 }: { targetId: string, certificateId: string, unscaledHeight?: number, naturalWidth?: number }) {
    const [downloading, setDownloading] = useState(false)

    const generateImageData = async (element: HTMLElement) => {
        const height = unscaledHeight || element.offsetHeight || 565
        // Warm up: html-to-image sometimes skips images on the first pass
        await Promise.all(Array.from(element.querySelectorAll('img')).map(img => img.decode().catch(() => {})))
        return await toPng(element, {
            pixelRatio: Math.max(1, naturalWidth / 800), // export at the template's native resolution
            width: 800,
            height: height,
            style: {
                transform: 'none',
                transformOrigin: 'top left',
                position: 'static',
                width: '800px',
                height: `${height}px`,
                borderRadius: '0',
                boxShadow: 'none'
            }
        })
    }

    const downloadPNG = async () => {
        const element = document.getElementById(targetId)
        if (!element) return

        setDownloading(true)
        try {
            const dataUrl = await generateImageData(element)
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
            const dataUrl = await generateImageData(element)
            const height = unscaledHeight || element.offsetHeight || 565
            const pixelRatio = Math.max(1, naturalWidth / 800)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [800 * pixelRatio, height * pixelRatio]
            })

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


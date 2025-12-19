'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PrintButton } from "./print-button";
import { QRCodeWrapper } from "./qr-code-wrapper";
import { DownloadButtons } from "./download-buttons";

export default function CertificateView({ certificate, participant, template, event, placeholders }: any) {
    // Scaling Logic
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const parentWidth = containerRef.current.parentElement?.offsetWidth || window.innerWidth;
                const baseWidth = 800; // Must match Designer width
                const newScale = Math.min((parentWidth - 32) / baseWidth, 1); // Cap at 1 to prevent over-scaling on large screens
                setScale(newScale > 0 ? newScale : 1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const certificateUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?id=${certificate.id}`;

    const getValue = (key: string) => {
        switch (key) {
            case 'participantName': return participant?.name || '';
            case 'eventName': return event?.name || '';
            case 'category': return participant?.category || '';
            case 'certificateLink': return certificateUrl;
            case 'date':
                if (event) {
                    let dateStr = new Date(event.startDate).toLocaleDateString();
                    if (event.endDate) {
                        dateStr += ` - ${new Date(event.endDate).toLocaleDateString()}`;
                    }
                    return dateStr;
                }
                return '';
            case 'qrCode': return certificateUrl;
            default: return '';
        }
    }

    const getGoogleFontsUrl = () => {
        const fonts = new Set(placeholders.flatMap((p: any) => [p.fontFamily, p.prefixFontFamily].filter(Boolean)));
        if (fonts.size === 0) return null;
        return `https://fonts.googleapis.com/css2?family=${Array.from(fonts).map((f: any) => (f as string).replace(/ /g, '+')).join('&family=')}&display=swap`;
    }
    const fontsUrl = getGoogleFontsUrl();

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col items-center py-12 px-4 gap-8">
            {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}

            <div className="w-full flex justify-center overflow-hidden" ref={containerRef}>
                <div
                    id="certificate-container"
                    className="bg-white shadow-2xl rounded-lg relative print:shadow-none print:w-[1123px] print:h-[794px] print:max-w-none print:m-0 print:p-0 print:absolute print:top-0 print:left-0 print:transform-none"
                    style={{
                        width: '800px',
                        visibility: scale ? 'visible' : 'hidden',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * 40}%`
                    }}
                >
                    <img src={template.imageUrl} alt="Certificate" className="w-full h-auto pointer-events-none select-none" />

                    {placeholders.map((p: any) => {
                        const value = getValue(p.key);

                        if (p.type === 'qr') {
                            const size = p.width || 100;
                            return (
                                <div
                                    key={p.id}
                                    className="absolute"
                                    style={{ left: p.x, top: p.y, width: size, height: size }}
                                >
                                    <QRCodeWrapper value={value} size={size} />
                                </div>
                            )
                        }

                        return (
                            <div
                                key={p.id}
                                className="absolute"
                                style={{
                                    left: p.x,
                                    top: p.y,
                                    width: p.width ? `${p.width}px` : 'auto',
                                    textAlign: p.textAlign || 'center',
                                    fontSize: `${p.fontSize || 16}px`,
                                    fontWeight: p.fontWeight || 'normal',
                                    color: p.color || '#000000',
                                    fontFamily: p.fontFamily || 'serif',
                                    whiteSpace: p.width ? 'normal' : 'nowrap'
                                }}
                            >
                                <span style={{
                                    color: p.prefixColor || p.color || '#000000',
                                    fontWeight: p.prefixFontWeight || p.fontWeight || 'normal',
                                    fontFamily: p.prefixFontFamily || p.fontFamily || 'inherit',
                                    fontSize: p.prefixFontSize ? `${p.prefixFontSize}px` : 'inherit'
                                }}>
                                    {p.prefix || ''}
                                </span>
                                {value}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex gap-4 flex-wrap justify-center print:hidden">
                <PrintButton />
                <DownloadButtons targetId="certificate-container" certificateId={certificate.id} />
                <Link href="/">
                    <Button variant="outline">Back to Home</Button>
                </Link>
            </div>

            <div className="print:hidden text-center text-sm text-muted-foreground">
                Verified Certificate: {certificate.id} <br />
                {participant ? (
                    <>Issued to {participant.name} for {event?.name}</>
                ) : (
                    <>Unassigned Draft Certificate</>
                )}
            </div>
        </div>
    );
}

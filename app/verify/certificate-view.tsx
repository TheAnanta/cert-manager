'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PrintButton } from "./print-button";
import { QRCodeWrapper } from "./qr-code-wrapper";
import { DownloadButtons } from "./download-buttons";

export default function CertificateView({ certificate, participant, template, event, placeholders }: any) {
    // Scaling & Height Logic
    const [scale, setScale] = useState<number>(1);
    const [certHeight, setCertHeight] = useState<number>(565);
    const containerRef = useRef<HTMLDivElement>(null);
    const certRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const parentWidth = containerRef.current.clientWidth || window.innerWidth;
                const baseWidth = 800; // Must match Designer base width
                const padding = parentWidth < 400 ? 16 : 32;
                const availableWidth = Math.max(parentWidth - padding, 260);
                const newScale = Math.min(availableWidth / baseWidth, 1);
                setScale(newScale > 0 ? newScale : 1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight) {
            const computedHeight = Math.round(800 * (img.naturalHeight / img.naturalWidth));
            setCertHeight(computedHeight);
        } else if (img.offsetHeight) {
            setCertHeight(img.offsetHeight);
        }
    };

    useEffect(() => {
        if (certRef.current && certRef.current.offsetHeight) {
            setCertHeight(certRef.current.offsetHeight);
        }
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

    const scaledWidth = Math.round(800 * scale);
    const scaledHeight = Math.round(certHeight * scale);

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col items-center py-6 sm:py-12 px-2 sm:px-4 gap-6 md:gap-8">
            {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}

            {/* Scaled Certificate Wrapper */}
            <div className="w-full flex justify-center items-center overflow-hidden" ref={containerRef}>
                <div
                    className="relative print:w-auto print:h-auto print:static"
                    style={{
                        width: `${scaledWidth}px`,
                        height: `${scaledHeight}px`,
                        transition: 'width 0.15s ease-out, height 0.15s ease-out'
                    }}
                >
                    <div
                        id="certificate-container"
                        ref={certRef}
                        className="bg-white shadow-2xl rounded-lg relative print:shadow-none print:w-[1123px] print:h-[794px] print:max-w-none print:m-0 print:p-0 print:absolute print:top-0 print:left-0 print:transform-none"
                        style={{
                            width: '800px',
                            height: `${certHeight}px`,
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        }}
                    >
                        <img
                            src={template.imageUrl}
                            alt="Certificate"
                            className="w-full h-auto pointer-events-none select-none block"
                            onLoad={handleImageLoad}
                            crossOrigin="anonymous"
                        />

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
            </div>

            <div className="flex gap-3 sm:gap-4 flex-wrap justify-center print:hidden px-2">
                <PrintButton />
                <DownloadButtons targetId="certificate-container" certificateId={certificate.id} unscaledHeight={certHeight} />
                <Link href="/">
                    <Button variant="outline">Back to Home</Button>
                </Link>
            </div>

            <div className="print:hidden text-center text-sm text-muted-foreground px-4">
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


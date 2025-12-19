'use client'

import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, QrCode, Trash2, Eye, Edit2 } from 'lucide-react';
import { FontPicker } from '@/components/font-picker';
import { QRCodeWrapper } from '@/app/verify/qr-code-wrapper';

type PlaceholderType = 'text' | 'qr';

export type Placeholder = {
    id: string;
    type: PlaceholderType;
    label: string; // Display label
    key: string; // Mapping key
    x: number;
    y: number;
    // Styling
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    prefix?: string;
    width?: number; // For QR or Text container
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    // Prefix Styling
    prefixColor?: string;
    prefixFontWeight?: string;
    prefixFontFamily?: string;
    prefixFontSize?: number;
};

const VARIABLE_OPTIONS = [
    { label: 'Participant Name', value: 'participantName' },
    { label: 'Event Name', value: 'eventName' },
    { label: 'Date', value: 'date' },
    { label: 'Category', value: 'category' },
    { label: 'Certificate Link', value: 'certificateLink' },
    { label: 'QR Code (Cert Link)', value: 'qrCode' },
];

type PreviewData = {
    participantName: string;
    eventName: string;
    date: string;
    category: string;
    certificateLink: string;
    qrCode: string;
    [key: string]: string;
};

const DraggableItem = ({
    item,
    isSelected,
    onClick,
    isPreviewMode,
    previewValue
}: {
    item: Placeholder,
    isSelected: boolean,
    onClick: () => void,
    isPreviewMode: boolean,
    previewValue?: string
}) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: item.id,
        disabled: isPreviewMode
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const finalStyle: React.CSSProperties = {
        ...style,
        left: item.x,
        top: item.y,
        position: 'absolute',
        cursor: isPreviewMode ? 'default' : 'move',
        border: isSelected && !isPreviewMode ? '2px solid blue' : '1px dashed transparent',
        zIndex: isSelected ? 10 : 1,
    };

    // Render Preview based on type
    const renderContent = () => {
        if (item.type === 'qr') {
            if (isPreviewMode) {
                return <QRCodeWrapper value={previewValue || 'https://example.com'} size={item.width || 100} />;
            }
            return (
                <div style={{ width: item.width || 100, height: item.width || 100, backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid black' }}>
                    <QrCode className="h-8 w-8 text-black" />
                </div>
            );
        }



        return (
            <div style={{
                fontSize: `${item.fontSize || 16}px`,
                fontWeight: (item.fontWeight as any) || 'normal',
                color: item.color || '#000000',
                // whiteSpace: 'nowrap', // Removed to allow wrapping if width is set
                width: item.width ? `${item.width}px` : 'auto',
                textAlign: item.textAlign || 'center',
                padding: '4px',
                backgroundColor: isSelected && !isPreviewMode ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                fontFamily: item.fontFamily || 'inherit',
                whiteSpace: item.width ? 'normal' : 'nowrap'
            }}>
                <span style={{
                    color: item.prefixColor || item.color || '#000000',
                    fontWeight: (item.prefixFontWeight || item.fontWeight || 'normal') as any,
                    fontFamily: item.prefixFontFamily || item.fontFamily || 'inherit',
                    fontSize: item.prefixFontSize ? `${item.prefixFontSize}px` : 'inherit'
                }}>
                    {item.prefix || ''}
                </span>
                {previewValue || item.label}
            </div>
        );
    };

    return (
        <div ref={setNodeRef} style={finalStyle} {...listeners} {...attributes} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {renderContent()}
        </div>
    );
};

export function CertificateDesigner({ imageUrl, onSave, initialPlaceholders }: { imageUrl: string, onSave: (placeholders: Placeholder[]) => void, initialPlaceholders?: Placeholder[] }) {
    const [placeholders, setPlaceholders] = useState<Placeholder[]>(initialPlaceholders || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData>({
        participantName: 'John Doe',
        eventName: 'Annual Tech Summit 2024',
        date: new Date().toLocaleDateString(),
        category: 'Excellence',
        certificateLink: 'https://example.com/verify/12345',
        qrCode: 'https://example.com/verify/12345'
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Dynamically load fonts
    useEffect(() => {
        const fontsToLoad = new Set<string>();
        placeholders.forEach(p => {
            if (p.fontFamily) fontsToLoad.add(p.fontFamily);
            if (p.prefixFontFamily) fontsToLoad.add(p.prefixFontFamily);
        });

        if (fontsToLoad.size > 0) {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${Array.from(fontsToLoad).map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            return () => {
                document.head.removeChild(link);
            }
        }
    }, [placeholders]);


    const handleDragEnd = (event: DragEndEvent) => {
        const { delta, active } = event;
        setPlaceholders(placeholders.map(p => {
            if (p.id === active.id) {
                return {
                    ...p,
                    x: p.x + delta.x,
                    y: p.y + delta.y
                };
            }
            return p;
        }));
    };

    const addText = () => {
        const id = `text-${Date.now()}`;
        setPlaceholders([...placeholders, {
            id,
            type: 'text',
            label: '{New Text}',
            key: 'participantName', // Default
            x: 50,
            y: 50,
            fontSize: 24,
            fontWeight: 'bold',
            color: '#000000',
            fontFamily: 'Roboto'
        }]);
        setSelectedId(id);
    };

    const addQR = () => {
        const id = `qr-${Date.now()}`;
        setPlaceholders([...placeholders, {
            id,
            type: 'qr',
            label: 'QR Code',
            key: 'qrCode',
            x: 100,
            y: 100,
            width: 100
        }]);
        setSelectedId(id);
    };

    const updateSelected = (updates: Partial<Placeholder>) => {
        if (!selectedId) return;
        setPlaceholders(placeholders.map(p => p.id === selectedId ? { ...p, ...updates } : p));
    };

    const deleteSelected = () => {
        if (!selectedId) return;
        setPlaceholders(placeholders.filter(p => p.id !== selectedId));
        setSelectedId(null);
    };

    const selectedItem = placeholders.find(p => p.id === selectedId);

    const getPreviewValue = (key: string) => {
        if (key === 'qrCode' || key === 'certificateLink') return previewData.certificateLink;
        return previewData[key] || '';
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Toolbar / Canvas Area */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-2 border-b pb-4">
                    {!isPreviewMode ? (
                        <>
                            <Button onClick={addText} variant="outline" className="gap-2"><Type className="h-4 w-4" /> Add Text</Button>
                            <Button onClick={addQR} variant="outline" className="gap-2"><QrCode className="h-4 w-4" /> Add QR Code</Button>
                        </>
                    ) : (
                        <div className="flex items-center text-sm text-muted-foreground italic">
                            Preview Mode - Dragging disabled
                        </div>
                    )}
                    <div className="flex-1"></div>
                    <Button
                        variant={isPreviewMode ? "secondary" : "outline"}
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className="gap-2"
                    >
                        {isPreviewMode ? <><Edit2 className="h-4 w-4" /> Edit Design</> : <><Eye className="h-4 w-4" /> Preview</>}
                    </Button>
                    <Button onClick={() => onSave(placeholders)}>Save Template</Button>
                </div>

                <div
                    className="border rounded-lg overflow-hidden relative bg-muted select-none group mx-auto shadow-sm"
                    style={{ width: '800px' }}
                    onClick={() => setSelectedId(null)}
                >
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <img src={imageUrl} alt="Certificate Template" className="w-full pointer-events-none" />
                        {placeholders.map(p => (
                            <DraggableItem
                                key={p.id}
                                item={p}
                                isSelected={p.id === selectedId}
                                onClick={() => !isPreviewMode && setSelectedId(p.id)}
                                isPreviewMode={isPreviewMode}
                                previewValue={getPreviewValue(p.key)}
                            />
                        ))}
                    </DndContext>
                </div>
            </div>

            {/* Properties / Preview Panel */}
            <div className="w-full lg:w-80 border-l pl-6 flex flex-col gap-6">

                {isPreviewMode ? (
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Preview Data
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Participant Name</Label>
                                <Input value={previewData.participantName} onChange={(e) => setPreviewData({ ...previewData, participantName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Event Name</Label>
                                <Input value={previewData.eventName} onChange={(e) => setPreviewData({ ...previewData, eventName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input value={previewData.date} onChange={(e) => setPreviewData({ ...previewData, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input value={previewData.category} onChange={(e) => setPreviewData({ ...previewData, category: e.target.value })} />
                            </div>
                        </div>
                        <div className="p-4 bg-muted rounded-md text-sm text-muted-foreground">
                            This data is for preview only. Actual certificates will use data from the Participants table.
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Properties</h3>
                            {selectedItem && (
                                <Button variant="ghost" size="icon" onClick={deleteSelected} className="text-red-500 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {!selectedItem ? (
                            <div className="space-y-4">
                                <p className="text-muted-foreground text-sm">Select an element to edit its properties.</p>

                                <div className="space-y-2 pt-4 border-t">
                                    <h4 className="text-sm font-medium">All Elements</h4>
                                    {placeholders.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">No elements added yet.</p>
                                    ) : (
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                            {placeholders.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => setSelectedId(p.id)}
                                                    className="flex items-center gap-3 p-2 rounded-md border bg-card hover:bg-accent cursor-pointer transition-colors"
                                                >
                                                    {p.type === 'qr' ? <QrCode className="h-4 w-4 text-muted-foreground" /> : <Type className="h-4 w-4 text-muted-foreground" />}
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="truncate font-medium">{p.label}</span>
                                                        <span className="text-xs text-muted-foreground">Pos: {Math.round(p.x)}, {Math.round(p.y)}</span>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setSelectedId(p.id); }}>
                                                        <Edit2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Data Mapping</Label>
                                    <Select
                                        value={selectedItem.key}
                                        onValueChange={(val) => updateSelected({ key: val, label: `{${VARIABLE_OPTIONS.find(o => o.value === val)?.label}}` })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select variable" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VARIABLE_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedItem.type === 'text' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Text Prefix</Label>
                                            <Input
                                                value={selectedItem.prefix || ''}
                                                onChange={(e) => updateSelected({ prefix: e.target.value })}
                                                placeholder="e.g. 'ID: '"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Font Family</Label>
                                            <FontPicker value={selectedItem.fontFamily || ''} onValueChange={(val) => updateSelected({ fontFamily: val })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Font Size (px)</Label>
                                            <Input
                                                type="number"
                                                value={selectedItem.fontSize || 16}
                                                onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Font Weight</Label>
                                            <Select
                                                value={selectedItem.fontWeight || 'normal'}
                                                onValueChange={(val) => updateSelected({ fontWeight: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="bold">Bold</SelectItem>
                                                    <SelectItem value="300">Light</SelectItem>
                                                    <SelectItem value="500">Medium</SelectItem>
                                                    <SelectItem value="700">Extra Bold</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={selectedItem.color || '#000000'}
                                                    className="w-12 p-1"
                                                    onChange={(e) => updateSelected({ color: e.target.value })}
                                                />
                                                <Input
                                                    value={selectedItem.color || '#000000'}
                                                    onChange={(e) => updateSelected({ color: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Width (px) - optional</Label>
                                            <Input
                                                type="number"
                                                value={selectedItem.width || ''}
                                                placeholder="Auto"
                                                onChange={(e) => updateSelected({ width: e.target.value ? Number(e.target.value) : undefined })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Text Align</Label>
                                            <Select
                                                value={selectedItem.textAlign || 'center'}
                                                onValueChange={(val: any) => updateSelected({ textAlign: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="left">Left</SelectItem>
                                                    <SelectItem value="center">Center</SelectItem>
                                                    <SelectItem value="right">Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>


                                        <div className="space-y-2 pt-4 border-t">
                                            <Label className="font-semibold">Prefix Styling</Label>
                                            <div className="space-y-2">
                                                <Label>Prefix Color</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={selectedItem.prefixColor || selectedItem.color || '#000000'}
                                                        className="w-12 p-1"
                                                        onChange={(e) => updateSelected({ prefixColor: e.target.value })}
                                                    />
                                                    <Input
                                                        value={selectedItem.prefixColor || selectedItem.color || '#000000'}
                                                        onChange={(e) => updateSelected({ prefixColor: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Prefix Font Weight</Label>
                                                <Select
                                                    value={selectedItem.prefixFontWeight || selectedItem.fontWeight || 'normal'}
                                                    onValueChange={(val) => updateSelected({ prefixFontWeight: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="bold">Bold</SelectItem>
                                                        <SelectItem value="300">Light</SelectItem>
                                                        <SelectItem value="500">Medium</SelectItem>
                                                        <SelectItem value="700">Extra Bold</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Prefix Font Family</Label>
                                                <FontPicker
                                                    value={selectedItem.prefixFontFamily || selectedItem.fontFamily || ''}
                                                    onValueChange={(val) => updateSelected({ prefixFontFamily: val })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedItem.type === 'qr' && (
                                    <div className="space-y-2">
                                        <Label>Size (px)</Label>
                                        <Input
                                            type="number"
                                            value={selectedItem.width || 100}
                                            onChange={(e) => updateSelected({ width: Number(e.target.value) })}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 pt-4 border-t">
                                    <Label>Position</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">X</Label>
                                            <Input
                                                type="number"
                                                value={Math.round(selectedItem.x)}
                                                onChange={(e) => updateSelected({ x: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Y</Label>
                                            <Input
                                                type="number"
                                                value={Math.round(selectedItem.y)}
                                                onChange={(e) => updateSelected({ y: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
}

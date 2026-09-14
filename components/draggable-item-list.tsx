"use client";

import React, { useRef, useState } from 'react';
import { GripVertical, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DraggableItemListProps<T extends { id: string }> {
    fields: T[];
    onReorder: (fromIndex: number, toIndex: number) => void;
    onRemove: (index: number) => void;
    renderItem: (index: number) => React.ReactNode;
    className?: string;
}

/**
 * Generic drag-and-drop reorderable list using native HTML5 drag events.
 * Uses stable `field.id` values (from react-hook-form's useFieldArray) rather
 * than array indexes for key stability during reorders.
 */
export function DraggableItemList<T extends { id: string }>({
    fields,
    onReorder,
    onRemove,
    renderItem,
    className,
}: DraggableItemListProps<T>) {
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragNodeRef = useRef<HTMLDivElement | null>(null);

    const handleDragStart = (index: number) => {
        setDraggingIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === index) return;
        onReorder(draggingIndex, index);
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const move = (index: number, direction: -1 | 1) => {
        const next = index + direction;
        if (next < 0 || next >= fields.length) return;
        onReorder(index, next);
    };

    if (fields.length === 0) return null;

    return (
        <div className={cn('space-y-3', className)}>
            {fields.map((field, index) => (
                <div
                    key={field.id}
                    ref={index === draggingIndex ? dragNodeRef : undefined}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                        'relative rounded-xl border bg-muted/25 p-4 sm:p-5 transition-[opacity,border-color,background-color,transform,box-shadow] duration-150',
                        draggingIndex === index
                            ? 'opacity-40 border-primary/50 bg-primary/5 scale-[0.99]'
                            : 'border-border',
                        dragOverIndex === index && draggingIndex !== index
                            ? 'border-primary/60 bg-primary/5 shadow-md shadow-primary/10'
                            : ''
                    )}
                >
                    {/* Drag Handle + Up/Down arrows */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground/40 hover:text-muted-foreground cursor-pointer"
                            onClick={() => move(index, -1)}
                            disabled={index === 0}
                            title="Move up"
                        >
                            <ArrowUp className="h-3 w-3" />
                        </Button>
                        <div
                            className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
                            title="Drag to reorder"
                        >
                            <GripVertical className="h-4 w-4" />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground/40 hover:text-muted-foreground cursor-pointer"
                            onClick={() => move(index, 1)}
                            disabled={index === fields.length - 1}
                            title="Move down"
                        >
                            <ArrowDown className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2.5 top-2.5 h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                        onClick={() => onRemove(index)}
                        title="Remove item"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                    {/* Item content with left padding for drag handle */}
                    <div className="pl-6 pr-8">
                        {renderItem(index)}
                    </div>
                </div>
            ))}
        </div>
    );
}

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, GripVertical, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ImageUploaderProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  minCount?: number;
  maxCount?: number;
  label?: string;
  className?: string;
}

export function ImageUploader({
  images,
  onChange,
  minCount = 5,
  maxCount = 20,
  label = 'Upload Photos',
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const addImages = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => {
        const isImg = /\.(jpe?g|png|webp)$/i.test(f.name);
        const isSmall = f.size <= 10 * 1024 * 1024;
        return isImg && isSmall;
      });
      const newImages: ImageFile[] = arr.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        preview: URL.createObjectURL(f),
      }));
      onChange([...images, ...newImages].slice(0, maxCount));
    },
    [images, maxCount, onChange]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addImages(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.preview);
    onChange(images.filter((i) => i.id !== id));
  };

  const handleDragItem = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('imageId', id);
  };

  const handleDropOnItem = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('imageId');
    if (!sourceId || sourceId === targetId) { setDragOver(null); return; }
    const src = images.findIndex((i) => i.id === sourceId);
    const tgt = images.findIndex((i) => i.id === targetId);
    const next = [...images];
    [next[src], next[tgt]] = [next[tgt], next[src]];
    onChange(next);
    setDragOver(null);
  };

  const meetsMin = images.length >= minCount;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Status bar */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            meetsMin ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          )}
        >
          {images.length} / {minCount} minimum
        </span>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200',
          dragging ? 'border-[#2563EB] bg-blue-50' : 'border-slate-200 bg-[#F9FAFB] hover:border-[#2563EB] hover:bg-blue-50/30',
          images.length >= maxCount && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addImages(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-9 h-9 bg-blue-100 text-[#2563EB] rounded-xl flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {images.length >= maxCount ? 'Maximum photos reached' : 'Add photos'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              JPG, PNG, WEBP · Max 10MB per image · Drag to reorder
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={(e) => handleDragItem(e, img.id)}
              onDragOver={(e) => { e.preventDefault(); setDragOver(img.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDropOnItem(e, img.id)}
              className={cn(
                'relative group aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-grab',
                dragOver === img.id ? 'border-[#2563EB] scale-105' : 'border-transparent hover:border-slate-300'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.preview} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <GripVertical className="w-4 h-4 text-white" />
              </div>
              {/* Index badge */}
              <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
                {idx + 1}
              </span>
              {/* Remove */}
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {/* Placeholder slots */}
          {images.length < minCount && Array.from({ length: minCount - images.length }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center"
            >
              <ImageIcon className="w-4 h-4 text-slate-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

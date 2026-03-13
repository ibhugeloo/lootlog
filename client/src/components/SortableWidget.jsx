import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const SortableWidget = ({ id, isEditing, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    if (!isEditing) {
        return <div>{children}</div>;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative rounded-xl border-2 border-dashed ${isDragging ? 'border-primary/50' : 'border-primary/20'} transition-colors`}
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute right-3 top-3 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/30 text-primary cursor-grab active:cursor-grabbing hover:bg-primary/20 transition-colors"
            >
                <GripVertical size={16} />
            </div>
            <div className="pointer-events-none select-none opacity-80">
                {children}
            </div>
        </div>
    );
};

export default SortableWidget;

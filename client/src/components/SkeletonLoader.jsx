import React from 'react';

/**
 * Skeleton loaders for dashboard loading state.
 * Replaces the basic spinner with visual placeholders.
 */

export const SkeletonStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#141417] border border-[#1F1F23] rounded-xl p-5 h-[110px] flex flex-col gap-3">
                <div className="bg-[#1A1A1F] animate-pulse rounded-lg h-3 w-3/5" />
                <div className="bg-[#1A1A1F] animate-pulse rounded-lg h-7 w-2/5" />
                <div className="bg-[#1A1A1F] animate-pulse rounded-lg h-2.5 w-1/2" />
            </div>
        ))}
    </div>
);

export const SkeletonChart = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-[#141417] border border-[#1F1F23] rounded-xl p-6 h-[300px] flex flex-col gap-4">
                <div className="bg-[#1A1A1F] animate-pulse rounded-lg h-4 w-2/5" />
                <div className="bg-[#1A1A1F] animate-pulse rounded-lg flex-1" />
            </div>
        ))}
    </div>
);

export const SkeletonTable = () => (
    <div className="bg-[#141417] border border-[#1F1F23] rounded-xl p-5 h-[400px] flex flex-col gap-4">
        <div className="bg-[#1A1A1F] animate-pulse rounded-lg h-4 w-1/4" />
        <div className="flex flex-col gap-0">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-[#1F1F23] last:border-b-0">
                    <div className="bg-[#1A1A1F] animate-pulse rounded-lg w-10 h-10 flex-shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className="bg-[#1A1A1F] animate-pulse rounded-lg h-3.5" style={{ width: `${60 + (i * 7) % 30}%` }} />
                        <div className="bg-[#1A1A1F] animate-pulse rounded-lg h-3 w-1/4" />
                    </div>
                    <div className="bg-[#1A1A1F] animate-pulse rounded-lg h-3.5 w-14" />
                </div>
            ))}
        </div>
    </div>
);

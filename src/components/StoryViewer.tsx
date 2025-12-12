'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Story {
    id: string;
    media_url: string;
    media_type: string;
}

interface StoryViewerProps {
    stories: Story[];
    onClose: () => void;
}

export default function StoryViewer({ stories, onClose }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const DURATION = 5000; // 5 seconds per story

    const startTimer = () => {
        clearInterval(intervalRef.current!);
        startTimeRef.current = Date.now();
        setProgress(0);

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = (elapsed / DURATION) * 100;

            if (newProgress >= 100) {
                nextStory();
            } else {
                setProgress(newProgress);
            }
        }, 50); // Update every 50ms
    };

    const nextStory = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            startTimer();
        } else {
            onClose();
        }
    };

    const prevStory = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            startTimer();
        } else {
            startTimer(); // Restart current story
        }
    };

    useEffect(() => {
        startTimer();
        return () => clearInterval(intervalRef.current!);
    }, []); // Only run once on mount? No, dependency logic handled in next/prev

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') nextStory();
            if (e.key === 'ArrowLeft') prevStory();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]); // Simplified dependency

    // Record View
    useEffect(() => {
        const recordView = async () => {
            const currentStory = stories[currentIndex];
            if (!currentStory) return;

            const { supabase } = await import('@/lib/supabaseClient');
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                try {
                    await supabase
                        .from('story_views')
                        .upsert({
                            story_id: currentStory.id,
                            viewer_id: user.id,
                            viewed_at: new Date().toISOString()
                        }, {
                            onConflict: 'story_id, viewer_id'
                        })
                        .select()
                        .maybeSingle();
                } catch (error) {
                    console.error('Error recording view:', error);
                }
            }
        };
        recordView();
    }, [currentIndex, stories]);

    const currentStory = stories[currentIndex];

    if (!currentStory) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 z-20 flex gap-2">
                {stories.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-75 ease-linear"
                            style={{
                                width: idx < currentIndex ? '100%' :
                                    idx === currentIndex ? `${progress}%` : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-4 z-30 p-2 text-white/80 hover:text-white"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Tap Zones */}
            <div className="absolute inset-0 z-10 flex">
                <div className="w-1/3 h-full" onClick={prevStory}></div>
                <div className="w-2/3 h-full" onClick={nextStory}></div>
            </div>

            {/* Navigation Arrows (Desktop) */}
            <button
                onClick={(e) => { e.stopPropagation(); prevStory(); }}
                className="hidden md:block absolute left-4 z-20 p-2 bg-black/20 rounded-full hover:bg-black/40 text-white"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); nextStory(); }}
                className="hidden md:block absolute right-4 z-20 p-2 bg-black/20 rounded-full hover:bg-black/40 text-white"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Story Content */}
            <div className="relative w-full h-full md:max-w-md md:aspect-[9/16] bg-black md:rounded-xl overflow-hidden shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={currentStory.media_url}
                    alt="Story"
                    className="w-full h-full object-contain"
                />
            </div>
        </div>
    );
}

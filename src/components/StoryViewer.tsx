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
    // Track viewed stories in this session to prevent duplicates
    const viewedStoriesRef = useRef<Set<string>>(new Set());

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

            // Client-side dedup: If already viewed in this session, skip.
            if (viewedStoriesRef.current.has(currentStory.id)) {
                console.log('StoryViewer: Already viewed story', currentStory.id);
                return;
            }

            console.log('StoryViewer: Recording view for story', currentStory.id);
            viewedStoriesRef.current.add(currentStory.id);

            const { supabase } = await import('@/lib/supabaseClient');
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) console.error('StoryViewer: Auth Error', authError);

            if (user) {
                console.log('StoryViewer: User found', user.id);
            } else {
                console.log('StoryViewer: Guest user');
            }

            try {
                // Prepare payload - viewer_id is optional/nullable now
                const payload: any = {
                    story_id: currentStory.id,
                    viewed_at: new Date().toISOString(),
                };

                if (user) {
                    payload.viewer_id = user.id;

                    const { data, error } = await supabase
                        .from('story_views')
                        .upsert(payload, {
                            onConflict: 'story_id, viewer_id'
                        })
                        .select()
                        .maybeSingle();

                    if (error) {
                        // If FK violation (user profile missing), try to auto-heal by creating the profile
                        if (error.code === '23503') {
                            console.warn('StoryViewer: User profile missing for ID ' + user.id + ', attempting to auto-create profile...');

                            // 1. Attempt to create the missing profile
                            const { error: profileError } = await supabase
                                .from('user_profiles')
                                .insert({
                                    id: user.id,
                                    email: user.email,
                                    // Add minimal required fields. 'updated_at' usually auto-handled or nullable.
                                    created_at: new Date().toISOString(),
                                });

                            if (!profileError) {
                                console.log('StoryViewer: Profile auto-created successfully. Retrying view record...');
                                // 2. Retry the original upsert
                                const { error: retryError } = await supabase
                                    .from('story_views')
                                    .upsert(payload, {
                                        onConflict: 'story_id, viewer_id'
                                    });

                                if (retryError) {
                                    console.error('StoryViewer: Retry failed after profile creation', retryError);
                                } else {
                                    console.log('StoryViewer: View recorded successfully after self-healing');
                                }
                            } else {
                                console.error('StoryViewer: Failed to auto-create profile', profileError);
                                // 3. Fallback to guest view if profile creation fails
                                console.warn('StoryViewer: Falling back to guest view due to profile error');
                                delete payload.viewer_id;
                                const { error: fallbackError } = await supabase
                                    .from('story_views')
                                    .insert(payload);

                                if (fallbackError) {
                                    console.error('StoryViewer: Fallback guest insert failed', fallbackError);
                                } else {
                                    console.log('StoryViewer: Fallback guest view recorded');
                                }
                            }
                        } else {
                            console.error('StoryViewer: Upsert failed', JSON.stringify(error, null, 2), error.message, error.code, error.details);
                        }
                    } else {
                        console.log('StoryViewer: View recorded successfully', data);
                    }
                } else {
                    // Guest user: Just insert, do not select (as they have no read permission)
                    const { error } = await supabase
                        .from('story_views')
                        .insert(payload);

                    if (error) {
                        console.error('StoryViewer: Guest insert failed', error);
                    } else {
                        console.log('StoryViewer: Guest view recorded');
                    }
                }

            } catch (error) {
                console.error('StoryViewer: Exception recording view:', error);
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
                    src={(() => {
                        const url = currentStory.media_url;
                        if (url.includes('/storage/v1/object/public/')) {
                            return `${url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=1080&resize=contain`;
                        }
                        return url;
                    })()}
                    alt="Story"
                    className="w-full h-full object-contain"
                />
            </div>
        </div>
    );
}

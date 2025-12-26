"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { usePathname } from "next/navigation";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Only show on home page
        if (pathname !== "/") return;

        // Check if previously dismissed
        const isDismissed = localStorage.getItem("pwaPromptDismissed");
        if (isDismissed) return;

        // Check if it's iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsVisible(false);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, [pathname]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsVisible(false);
            localStorage.setItem("pwaPromptDismissed", "true");
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("pwaPromptDismissed", "true");
    };

    if (!isVisible && !isIOS) return null;
    if (!isVisible) return null;

    // Double check pathname rendering to be safe
    if (pathname !== "/") return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-start gap-4">
                <div className="shrink-0 p-2 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <img
                        src="/v-icon-black.png"
                        alt="Vallaroo Logo"
                        className="w-10 h-10 object-contain dark:invert"
                    />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg mb-1 dark:text-white">
                            Install Vallaroo
                        </h3>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors -mt-1 -mr-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Install our app for a better experience, offline access, and easier
                        shopping!
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleInstallClick}
                            className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            <Download size={16} />
                            Install App
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Not now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

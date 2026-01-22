"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: any;
    }
}

export default function GoogleTranslate() {
    const pathname = usePathname();

    useEffect(() => {
        // 1. Initialize Google Translate Script ONLY ONCE
        if (!window.googleTranslateElementInit) {
            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        includedLanguages: "en,hi,bn,te,mr,ta,ur,gu,kn,ml,pa,or,as,ma,sa",
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    "google_translate_element"
                );
            };
        }

        // --- HACK: Monkey Patch removeChild to prevent Google Translate Crashes ---
        // Google Translate modifies the DOM (wrapping text in <font> tags). 
        // When React tries to remove a Text Node that it thinks is a direct child, 
        // but is now inside a <font> tag, it crashes with "The node to be removed is not a child of this node".
        const originalRemoveChild = Node.prototype.removeChild;
        Node.prototype.removeChild = function (child) {
            if (child.parentNode !== this) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('[GoogleTranslate] Suppressed removeChild error: Child not found in parent.', child);
                }
                return child; // Pretend we removed it
            }
            return originalRemoveChild.apply(this, arguments as any);
        };

        // Also patch insertBefore just in case
        const originalInsertBefore = Node.prototype.insertBefore;
        Node.prototype.insertBefore = function (newNode, referenceNode) {
            if (referenceNode && referenceNode.parentNode !== this) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('[GoogleTranslate] Suppressed insertBefore error: Reference node not found in parent.', referenceNode);
                }
                if (referenceNode instanceof Element) {
                    // Try to recover by appending or just ignoring? 
                    // Usually insertBefore issues are harder, but removeChild is the main culprit.
                    // We'll just fall back to appendChild if safe, or return.
                    return this.appendChild(newNode);
                }
            }
            return originalInsertBefore.apply(this, arguments as any);
        };

        return () => {
            // Restore? Usually better to leave customized in this session to prevent future crashes.
            // But if we want to be clean:
            Node.prototype.removeChild = originalRemoveChild;
            Node.prototype.insertBefore = originalInsertBefore;
        };
    }, []);

    // 2. Logic to move the widget to specific containers with Proper Cleanup (Rescue)
    useEffect(() => {
        const moveWidget = () => {
            const source = document.getElementById("google_translate_element");
            const target = document.getElementById("language-switcher-target");

            if (source && target) {
                target.appendChild(source);
                source.style.display = 'inline-flex';
                // Reset fixed positioning if it was floating
                source.style.position = 'static';
                source.style.bottom = 'auto';
                source.style.right = 'auto';
                source.style.zIndex = 'auto';
            } else if (source) {
                // Fallback: Float it if no target found
                document.body.appendChild(source);
                source.style.position = 'fixed';
                source.style.bottom = '20px';
                source.style.right = '20px';
                source.style.zIndex = '9999';
                source.style.display = 'inline-flex';
            }
        };

        const t = setTimeout(moveWidget, 500);

        // CLEANUP: Rescue the widget back to safe harbor
        // This is CRITICAL to prevent 'removeChild' errors when the Target (Dashboard) unmounts.
        return () => {
            clearTimeout(t);
            // We can't easily rely on wrapperRef here because this effect runs after unmount of children?
            // Actually, layout doesn't unmount.
            // We should find the wrapper by ID or ref.
            // But simpler: just append it back to document.body and hide it? 
            // Or append to a hidden container in this component.

            const source = document.getElementById("google_translate_element");
            // Ideally we put it back in the wrapperRef so it is ready for next render.
            // But accessing ref in cleanup is fine.
            // However, let's just make sure it is NOT in the target that is about to disappear.
            if (source) {
                document.body.appendChild(source);
                source.style.display = 'none';
            }
        };
    }, [pathname]);

    return (
        <>
            {/* The Source Container for the Google Widget - Initially Hidden */}
            <div id="google_translate_element" style={{ display: 'none' }} />

            <Script
                src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="afterInteractive"
            />

            <style jsx global>{`
        /* 1. Hide Top Bar and Tooltips Completely */
        .goog-te-banner-frame.skiptranslate, 
        .goog-te-banner-frame,
        #goog-gt-tt,
        .goog-tooltip {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
        }
        body {
            top: 0px !important;
        }
        
        /* --- RESET & CLEANUP --- */
        
        /* 1. The Main Button Container */
        #google_translate_element .goog-te-gadget-simple {
            background-color: #f3f4f6 !important; /* Light gray to match UI */
            border: none !important;
            padding: 8px 12px !important;
            border-radius: 8px !important; /* Slightly rounded, not full pill */
            font-family: inherit !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            color: #374151 !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 40px !important;
            box-sizing: border-box !important;
            line-height: normal !important;
            white-space: nowrap !important;
        }

        #google_translate_element .goog-te-gadget-simple:hover {
            background-color: #e5e7eb !important;
            color: #111827 !important;
        }

        /* 2. HIDE ALL GOOGLE BRANDING & ICONS */
        .goog-te-gadget-icon, 
        .goog-te-gadget-simple img,
        .goog-te-gadget-simple .goog-te-menu-value span:nth-of-type(3) { 
            display: none !important; /* Hides G logo and miscellaneous junk */
        }
        
        /* 3. Hide the Vertical Divider */
        .goog-te-menu-value span {
            border-left: none !important; /* Kill the pipe | separator */
            color: inherit !important;
        }

        /* 4. Custom Icon Injection */
        #google_translate_element .goog-te-gadget-simple::before {
            content: "🌐"; /* Simple text-based icon or use an SVG via background-image if needed */
            font-size: 16px;
            margin-right: 8px;
            display: inline-block;
            vertical-align: middle;
        }

        /* 5. Clean up the Text Span */
        .goog-te-menu-value {
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            max-width: 90px;
        }
        
        .goog-te-menu-value span {
            float: none !important; 
            padding: 0 !important;
            text-decoration: none !important;
            vertical-align: middle !important;
            display: inline-block !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        /* Hide Top Bar Frame */
        .goog-te-banner-frame {
            display: none !important;
        }
        body {
            top: 0 !important;
        }


        /* --- STYLING THE DROPDOWN LIST (The Iframe Container) --- */
        .goog-te-menu-frame {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
            border-radius: 16px !important;
            border: 1px solid #f3f4f6 !important;
            overflow: hidden !important;
            margin-top: 8px !important;
        }

      `}</style>
        </>
    );
}

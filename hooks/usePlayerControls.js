import { useCallback, useRef, useState } from 'react';

/**
 * usePlayerControls
 * Manages show/hide logic for the player overlay controls.
 *
 * Params:
 *   isPlaying    — boolean, whether the video is currently playing
 *   isSeeking    — boolean, whether the user is dragging the seek bar
 *   showSpeedMenu — boolean, whether the speed picker is open
 *
 * Returns:
 *   showControls  — boolean
 *   controlsTimer — ref (pass to clearTimeout when needed externally)
 *   revealControls — () => void  — call on any tap/gesture to show controls & restart timer
 *   resetTimer     — () => void  — restart the auto-hide countdown
 */
export function usePlayerControls({ isPlaying, isSeeking, showSpeedMenu }) {
    const [showControls, setShowControls] = useState(true);
    const controlsTimer = useRef(null);

    const resetTimer = useCallback(() => {
        clearTimeout(controlsTimer.current);
        if (isPlaying && !isSeeking && !showSpeedMenu) {
            controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
        }
    }, [isPlaying, isSeeking, showSpeedMenu]);

    const revealControls = useCallback(() => {
        setShowControls(true);
        resetTimer();
    }, [resetTimer]);

    return { showControls, controlsTimer, revealControls, resetTimer };
}
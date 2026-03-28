import * as Brightness from 'expo-brightness';
import { useMemo, useState } from 'react';
import { PanResponder, useWindowDimensions } from 'react-native';
import { VolumeManager } from 'react-native-volume-manager';

export function useSwipeGesture({ locked, revealControls, controlsTimer }) {
    const { height } = useWindowDimensions();
    const SWIPE_SENSITIVITY = height * 1.8;

    const [brightnessVal, setBrightnessVal] = useState(0.5);
    const [volumeVal, setVolumeVal] = useState(0.8);
    const [showBrightness, setShowBrightness] = useState(false);
    const [showVolume, setShowVolume] = useState(false);

    const makeSwipe = (side) =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => !locked,
            onMoveShouldSetPanResponder: (_, g) =>
                Math.abs(g.dy) > 10 && Math.abs(g.dy) > Math.abs(g.dx) * 1.5,

            onPanResponderGrant: () => {
                side === 'left' ? setShowBrightness(true) : setShowVolume(true);
                clearTimeout(controlsTimer.current);
            },

            onPanResponderMove: (_, g) => {
                const delta = -g.dy / SWIPE_SENSITIVITY;

                if (side === 'left') {
                    setBrightnessVal(v => {
                        const next = Math.min(1, Math.max(0, v + delta));
                        Brightness.setBrightnessAsync(next).catch(() => { });
                        return next;
                    });
                } else {
                    setVolumeVal(v => {
                        const next = Math.min(1, Math.max(0, v + delta));
                        VolumeManager.setVolume(next, { showUI: false }).catch(() => { });
                        return next;
                    });
                }
            },

            onPanResponderRelease: (_, g) => {
                if (Math.abs(g.dy) < 10 && Math.abs(g.dx) < 10) {
                    revealControls();
                }
                setTimeout(() => {
                    setShowBrightness(false);
                    setShowVolume(false);
                }, 900);
                revealControls();
            },
        });

    // ✅ SWIPE_SENSITIVITY added to deps so it recalculates on rotation
    const leftSwipe = useMemo(() => makeSwipe('left'), [locked, revealControls, SWIPE_SENSITIVITY]);
    const rightSwipe = useMemo(() => makeSwipe('right'), [locked, revealControls, SWIPE_SENSITIVITY]);

    return {
        leftSwipe,
        rightSwipe,
        brightnessVal,
        volumeVal,
        showBrightness,
        showVolume,
        setBrightnessVal,
        setVolumeVal,
    };
}
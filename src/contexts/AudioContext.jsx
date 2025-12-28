import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [sfxVolume, setSfxVolume] = useState(0.5); // 50% default
    const [musicVolume, setMusicVolume] = useState(0.5); // 50% default
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);

    // Refs for audio elements
    const audioElementsRef = useRef({});
    const bgMusicRef = useRef(null);

    // Initialize sound effects and background music
    useEffect(() => {
        // Initialize background music with loop
        bgMusicRef.current = new Audio('/audio/bg-music.mp3');
        bgMusicRef.current.loop = true; // Looping enabled
        bgMusicRef.current.volume = isMuted ? 0 : musicVolume; // 50% volume

        // Preload sound effects
        const sfxToPreload = ['purchase-success', 'purchase-fail'];
        sfxToPreload.forEach(sfx => {
            const audio = new Audio(`/audio/${sfx}.mp3`);
            if (sfx === 'purchase-success') {
                audio.volume = sfxVolume * 0.3; // Success sound at 30% of SFX volume
            } else {
                audio.volume = sfxVolume; // Fail sound at regular SFX volume
            }
            audioElementsRef.current[sfx] = audio;
        });

        // Try to auto-play music after user interaction
        const handleFirstInteraction = () => {
            if (!isMusicPlaying && bgMusicRef.current) {
                playBackgroundMusic();
            }
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };

        // Set up auto-play after user interaction
        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);

        // Cleanup on unmount
        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current = null;
            }
            Object.values(audioElementsRef.current).forEach(audio => {
                audio.pause();
            });
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
    }, []);

    // Update SFX volume when changed
    useEffect(() => {
        Object.keys(audioElementsRef.current).forEach(key => {
            const audio = audioElementsRef.current[key];
            if (key === 'purchase-success') {
                audio.volume = isMuted ? 0 : sfxVolume * 0.3; // 30% of SFX volume
            } else {
                audio.volume = isMuted ? 0 : sfxVolume;
            }
        });
    }, [sfxVolume, isMuted]);

    // Update music volume when changed
    useEffect(() => {
        if (bgMusicRef.current) {
            bgMusicRef.current.volume = isMuted ? 0 : musicVolume; // 50% volume
        }
    }, [musicVolume, isMuted]);

    // Function to play background music
    const playBackgroundMusic = () => {
        if (bgMusicRef.current && !isMuted) {
            bgMusicRef.current.play()
                .then(() => {
                    setIsMusicPlaying(true);
                })
                .catch(error => {
                    console.log("Autoplay prevented. User interaction required.");
                });
        }
    };

    // Function to pause background music
    const pauseBackgroundMusic = () => {
        if (bgMusicRef.current) {
            bgMusicRef.current.pause();
            setIsMusicPlaying(false);
        }
    };

    // Function to toggle background music play/pause
    const toggleBackgroundMusic = () => {
        if (isMusicPlaying) {
            pauseBackgroundMusic();
        } else {
            playBackgroundMusic();
        }
    };

    // Function to play sound effect
    const playSoundEffect = (soundName) => {
        if (isMuted) return;

        // Check if audio is already loaded
        let audio = audioElementsRef.current[soundName];

        if (!audio) {
            // Create new audio element if not preloaded
            audio = new Audio(`/audio/${soundName}.mp3`);
            if (soundName === 'purchase-success') {
                audio.volume = sfxVolume * 0.3; // 30% of SFX volume
            } else {
                audio.volume = sfxVolume;
            }
            audioElementsRef.current[soundName] = audio;
        }

        // Reset and play
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.error(`Error playing sound ${soundName}:`, error);
        });
    };

    // Toggle mute
    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    // Control SFX volume
    const changeSfxVolume = (volume) => {
        setSfxVolume(Math.max(0, Math.min(1, volume)));
    };

    // Control Music volume
    const changeMusicVolume = (volume) => {
        setMusicVolume(Math.max(0, Math.min(1, volume)));
    };

    const value = {
        isMuted,
        sfxVolume,
        musicVolume,
        isMusicPlaying,
        playSoundEffect,
        toggleMute,
        changeSfxVolume,
        changeMusicVolume,
        playBackgroundMusic,
        pauseBackgroundMusic,
        toggleBackgroundMusic,
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
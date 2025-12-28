import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { BsVolumeUp, BsVolumeMute, BsMusicNoteBeamed, BsPlay, BsPause } from 'react-icons/bs';

const AudioControls = () => {
    const {
        isMuted,
        toggleMute,
        sfxVolume,
        changeSfxVolume,
        musicVolume,
        changeMusicVolume,
        isMusicPlaying,
        toggleBackgroundMusic,
        playSoundEffect
    } = useAudio();

    return (
        <div className="fixed top-16 right-4 z-50 bg-base-200 rounded-lg shadow-xl p-4 w-72 border border-base-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                    <BsMusicNoteBeamed /> Audio Settings
                </h3>
                <button
                    onClick={toggleMute}
                    className={`btn btn-circle btn-sm ${isMuted ? 'btn-error' : 'btn-success'}`}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <BsVolumeMute /> : <BsVolumeUp />}
                </button>
            </div>

            <div className="space-y-4">
                {/* Background Music Controls */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="label-text font-semibold">Background Music</label>
                        <span className="text-xs">{Math.round(musicVolume * 100)}%</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={toggleBackgroundMusic}
                            className={`btn btn-xs ${isMusicPlaying ? 'btn-secondary' : 'btn-primary'}`}
                            disabled={isMuted}
                            title={isMusicPlaying ? "Pause Music" : "Play Music"}
                        >
                            {isMusicPlaying ? <BsPause /> : <BsPlay />}
                            <span className="ml-1">{isMusicPlaying ? 'Pause' : 'Play'}</span>
                        </button>
                        <span className="text-xs ml-auto">
                            {isMusicPlaying ? '▶️ Playing' : '⏸️ Paused'}
                        </span>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={musicVolume}
                        onChange={(e) => changeMusicVolume(parseFloat(e.target.value))}
                        className="range range-xs range-secondary"
                        disabled={isMuted}
                    />
                </div>

                {/* Sound Effects Volume */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="label-text font-semibold">Sound Effects</label>
                        <span className="text-xs">{Math.round(sfxVolume * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={sfxVolume}
                        onChange={(e) => changeSfxVolume(parseFloat(e.target.value))}
                        className="range range-xs range-primary"
                        disabled={isMuted}
                    />
                </div>
            </div>
        </div>
    );
};

export default AudioControls;
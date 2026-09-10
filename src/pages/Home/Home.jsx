import React, { useRef, useState, useEffect } from 'react';
import '../Home/Home.css';
import { useNavigate } from 'react-router-dom';
import { IoSettingsSharp } from "react-icons/io5";
import { FaStepBackward, FaStepForward } from "react-icons/fa";
import CountdownOverlay from '../Countdown/CountdownOverlay';

import logoBlanco from "../../images/La_Nro_1_Logo_blanco.png";

const VIDEOS = [
  { id: 1, src: './videos/ejercicio_01.mp4', title: 'Pausa 1' },
  { id: 2, src: './videos/ejercicio_02.mp4', title: 'Pausa 2' },
  { id: 3, src: './videos/ejercicio_03.mp4', title: 'Pausa 3' },
];

const Home = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0); // Estado del video actual (0 = Video 1)
    const [isCounting, setIsCounting] = useState(false);
    const remindersActive = JSON.parse(localStorage.getItem('pausas_remindersEnabled')) ?? false;
    const timeBefore = localStorage.getItem('pausas_reminderTime') || '5';

    const startCountdown = () => {
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
        setIsCounting(true);
    };

    const handleCountdownComplete = () => {
        setIsCounting(false);
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        // Verificamos que el puente exista
        if (window.electron) {
            // 1. RECEPTOR DE SEÑALES DEL ELECTRÓN
            window.electron.onIniciarPausa(() => {
                console.log("¡Señal recibida desde la notificación nativa!");
                startCountdown();
            });

            // 2. EMISOR DE CONFIGURACIÓN A ELECTRON AL ARRANCAR (Lo nuevo)
            const guardadoHabilitado = JSON.parse(localStorage.getItem('pausas_remindersEnabled')) || false;
            const tiempoGuardado = localStorage.getItem('pausas_reminderTime') || '5';
            const tiempoPosponer = localStorage.getItem('pausas_snoozeTime') || '0';
            
            window.electron.guardarConfiguracion({
                remindersEnabled: guardadoHabilitado,
                reminderTime: parseInt(tiempoGuardado, 10),
                snoozeTime: parseInt(tiempoPosponer, 10)
            });
            
            console.log("Configuración inicial enviada a Electron en segundo plano.");
        }
    }, []);

    const changeVideo = (index) => {
        setCurrentVideoIndex(index);
        setIsPlaying(false);
        // Pequeño timeout para dar tiempo a que React actualice el src antes de iniciar la cuenta
        setTimeout(() => {
            startCountdown();
        }, 50);
    }

    const togglePlay = () => {
        if (isCounting) return;
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                if (videoRef.current.currentTime === 0) {
                    startCountdown();
                } else {
                    videoRef.current.play();
                    setIsPlaying(true);
                }
            }
        }
    };

    // Ir al video anterior
    const handlePrevious = () => {
        const nextIndex = currentVideoIndex > 0 ? currentVideoIndex - 1 : VIDEOS.length - 1;
        changeVideo(nextIndex);
    };

    // Ir al video siguiente
    const handleNext = () => {
        const nextIndex = currentVideoIndex < VIDEOS.length - 1 ? currentVideoIndex + 1 : 0;
        changeVideo(nextIndex);
    };

    return (
        <div className="app-container">
            {/* Cabecera */}
            <div className="app-header">
                <h1 className='app-title'>Haga una pausa. Pausas Activas.</h1>
                <img src={logoBlanco} alt="lanumero1" className="app-logo" width={85} />
            </div>

            {/* Reproductor de Video */}
            <div className="app-body">
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <CountdownOverlay isCounting={isCounting} onComplete={handleCountdownComplete} />
                    <video
                        key={VIDEOS[currentVideoIndex].src}
                        ref={videoRef}
                        className="video-player"
                        src={VIDEOS[currentVideoIndex].src}
                        preload='auto'
                        onEnded={handleNext}
                    />
                </div>
            </div>

            {/* Pie de página / Controles */}
            <div className="app-footer">
                <div className="control-button" onClick={handlePrevious}>
                    <FaStepBackward/>
                </div>

                {/* Botones de números dinámicos */}
                {VIDEOS.map((video, index) => (
                    <div 
                        key={video.id}
                        className={index === currentVideoIndex ? "active-number-button" : "number-button"}
                        onClick={() => changeVideo(index)}
                    >
                        <span>{video.id}</span>
                    </div>
                ))}

                <div className="control-button" onClick={handleNext}>
                    <FaStepForward/>
                </div>

                <div className="settings-control-button" onClick={() => navigate('/settings')} title="Configuración">
                    <IoSettingsSharp/>
                </div>
                
                <div className='playback-actions-container'>
                    <div className="restart-floating-button" onClick={() => {
                        if (videoRef.current) {
                            startCountdown();
                        }
                    }} title='Reiniciar'>
                        <span><strong>&#8634;</strong></span> {/* Reiniciar video */}
                    </div>

                    <div className="large-play-button" onClick={togglePlay}>
                        <span className="large-play-icon">
                            {isPlaying ? '⏸' : '►'}
                        </span>
                    </div>
                </div>                
            </div>
        </div>
    );
};

export default Home;
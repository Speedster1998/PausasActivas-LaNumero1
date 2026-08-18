import React, { useRef, useState, useEffect } from 'react';
import '../Home/Home.css';
import { useNavigate } from 'react-router-dom';
import { IoSettingsSharp } from "react-icons/io5";
import { FaStepBackward, FaStepForward } from "react-icons/fa";


const VIDEOS = [
  { id: 1, src: '/videos/ejercicio_01.mp4', title: 'Pausa 1' },
  { id: 2, src: '/videos/ejercicio_02.mp4', title: 'Pausa 2' },
  { id: 3, src: '/videos/ejercicio_03.mp4', title: 'Pausa 3' },
];

const Home = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0); // Estado del video actual (0 = Video 1)
    const remindersActive = JSON.parse(localStorage.getItem('pausas_remindersEnabled')) ?? false;
    const timeBefore = localStorage.getItem('pausas_reminderTime') || '5';

    useEffect(() => {
        // Verificamos que el puente exista (por si corres la app en web por error)
        if (window.electron) {
            window.electron.onIniciarPausa(() => {
                console.log("¡Señal recibida desde la notificación nativa!");
                if (videoRef.current) {
                    videoRef.current.play(); // Reproducimos el video
                    setIsPlaying(true);      // Actualizamos el botón de Play a Pausa
                }
            });
        }
    }, []);

    // Cambiar a un video específico
    const changeVideo = (index) => {
        setCurrentVideoIndex(index);
        setIsPlaying(true);
        // Pequeño timeout para dar tiempo a que React actualice el src antes de dar .play()
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.play();
            }
        }, 50);
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
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
                <img src="./src/images/La_Nro_1_Logo_blanco.png" alt="lanumero1" class="app-logo" width={85} />
            </div>

            {/* Reproductor de Video */}
            <div className="app-body">
                <video
                    key={VIDEOS[currentVideoIndex].src} // La key fuerza el re-render limpio cuando cambia el video
                    ref={videoRef}
                    className="video-player"
                    src={VIDEOS[currentVideoIndex].src}
                    preload='auto'
                    onEnded={() => setIsPlaying(false)}
                />
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
                            videoRef.current.currentTime = 0;
                            videoRef.current.play();
                            setIsPlaying(true);
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
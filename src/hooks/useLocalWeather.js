// --- ARQUIVO: src/hooks/useLocalWeather.js ---
import { useState, useEffect } from "react";

export const useLocalWeather = () => {
    const [weather, setWeather] = useState({ temp: "--", humidity: "--", loading: true });

    useEffect(() => {
        if (!navigator.geolocation) {
            setWeather({ temp: "N/A", humidity: "N/A", loading: false });
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // API Gratuita Open-Meteo (Não requer chave API)
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`
                );
                const data = await response.json();
                
                setWeather({
                    temp: Math.round(data.current.temperature_2m),
                    humidity: Math.round(data.current.relative_humidity_2m),
                    loading: false
                });
            } catch (error) {
                console.error("Erro ao buscar clima:", error);
                setWeather({ temp: "Err", humidity: "Err", loading: false });
            }
        }, (error) => {
            console.warn("Permissão de localização negada", error);
            // Fallback para valores padrão se o usuário negar
            setWeather({ temp: 24, humidity: 45, loading: false });
        });
    }, []);

    return weather;
};
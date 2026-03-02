import { useState, useCallback } from 'react';

export interface GeolocationState {
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    error: string | null;
    loading: boolean;
}

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        lat: null,
        lng: null,
        accuracy: null,
        error: null,
        loading: false,
    });

    const getPosition = useCallback((): Promise<GeolocationCoordinates> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Trình duyệt không hỗ trợ định vị GPS'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve(pos.coords),
                (err) => {
                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            reject(new Error('Bạn đã từ chối quyền truy cập vị trí'));
                            break;
                        case err.POSITION_UNAVAILABLE:
                            reject(new Error('Không thể xác định vị trí lúc này'));
                            break;
                        case err.TIMEOUT:
                            reject(new Error('Hết thời gian lấy vị trí, thử lại nhé'));
                            break;
                        default:
                            reject(new Error('Lỗi không xác định khi lấy vị trí'));
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }, []);

    const fetchPosition = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const coords = await getPosition();
            setState({
                lat: coords.latitude,
                lng: coords.longitude,
                accuracy: coords.accuracy,
                error: null,
                loading: false,
            });
            return coords;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi không xác định';
            setState((prev) => ({ ...prev, error: message, loading: false }));
            return null;
        }
    }, [getPosition]);

    return { ...state, fetchPosition };
}

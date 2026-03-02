import { useEffect, useState, useCallback, useRef } from 'react';
import { ref, set, onValue, off } from 'firebase/database';
import { db } from '../lib/firebase';

export interface RoomLocation {
    lat: number;
    lng: number;
}

export interface RoomData {
    location: RoomLocation | null;
    updatedAt: number | null;
    source: 'manual' | 'web_auto' | 'owntracks' | null;
    status: 'standing_still' | 'moving' | null;
}

export function useRoom(roomId: string | null) {
    const [roomData, setRoomData] = useState<RoomData>({
        location: null,
        updatedAt: null,
        source: null,
        status: null,
    });
    const [isConnected, setIsConnected] = useState(false);
    const prevLocationRef = useRef<RoomLocation | null>(null);

    // Lắng nghe dữ liệu real-time từ Firebase
    useEffect(() => {
        if (!roomId || !db) return;
        const roomRef = ref(db, `rooms/${roomId}`);

        const unsubscribe = onValue(roomRef, (snapshot) => {
            setIsConnected(true);
            if (snapshot.exists()) {
                const data = snapshot.val() as RoomData;
                if (prevLocationRef.current && data.location) {
                    const dist = Math.sqrt(
                        Math.pow(data.location.lat - prevLocationRef.current.lat, 2) +
                        Math.pow(data.location.lng - prevLocationRef.current.lng, 2)
                    );
                    data.status = dist > 0.00005 ? 'moving' : 'standing_still';
                }
                prevLocationRef.current = data.location;
                setRoomData(data);
            }
        });

        return () => {
            off(roomRef);
            unsubscribe();
        };
    }, [roomId]);

    // Ghi vị trí lên Firebase
    const updateLocation = useCallback(
        async (lat: number, lng: number, source: 'manual' | 'web_auto') => {
            if (!roomId || !db) return;
            const roomRef = ref(db, `rooms/${roomId}`);
            await set(roomRef, {
                location: { lat, lng },
                updatedAt: Date.now(),
                source,
                status: 'standing_still',
            });
        },
        [roomId]
    );

    return { roomData, isConnected, updateLocation };
}

import { useEffect, useState, useCallback, useRef } from 'react';
import { ref, set, onValue, off, remove, get } from 'firebase/database';
import { db } from '../lib/firebase';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000; // 3 giờ

export interface RoomLocation {
    lat: number;
    lng: number;
}

export interface RoomData {
    location: RoomLocation | null;
    updatedAt: number | null;
    source: 'manual' | 'web_auto' | 'owntracks' | null;
    status: 'standing_still' | 'moving' | null;
    username: string | null;
}

export function useRoom(roomId: string | null) {
    const [roomData, setRoomData] = useState<RoomData>({
        location: null,
        updatedAt: null,
        source: null,
        status: null,
        username: null,
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

                // Kiểm tra xem dữ liệu có quá 3h không -> tự động xóa
                if (data.updatedAt && Date.now() - data.updatedAt > THREE_HOURS_MS) {
                    remove(roomRef);
                    setRoomData({
                        location: null,
                        updatedAt: null,
                        source: null,
                        status: null,
                        username: null,
                    });
                    return;
                }

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

    // Cleanup: kiểm tra và xóa phòng quá hạn khi mount
    useEffect(() => {
        if (!roomId || !db) return;
        const roomRef = ref(db, `rooms/${roomId}`);

        get(roomRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.updatedAt && Date.now() - data.updatedAt > THREE_HOURS_MS) {
                    remove(roomRef);
                }
            }
        });
    }, [roomId]);

    // Đăng ký phòng vào user_rooms ngay khi vào trang (luôn refresh updatedAt để phòng không bị lọc mất)
    const registerRoom = useCallback(
        async (username: string) => {
            if (!roomId || !db || !username) return;
            const userRoomRef = ref(db, `user_rooms/${username}/${roomId}`);
            // Luôn cập nhật updatedAt để tránh bị lọc ra khỏi lịch sử do timeout 3h
            await set(userRoomRef, { updatedAt: Date.now() });
        },
        [roomId]
    );

    // Ghi vị trí lên Firebase
    const updateLocation = useCallback(
        async (lat: number, lng: number, source: 'manual' | 'web_auto', username?: string) => {
            if (!roomId || !db) return;
            const roomRef = ref(db, `rooms/${roomId}`);
            const now = Date.now();
            await set(roomRef, {
                location: { lat, lng },
                updatedAt: now,
                source,
                status: 'standing_still',
                username: username || null,
            });
            // Cập nhật lại timestamp trong user_rooms
            if (username) {
                const userRoomRef = ref(db, `user_rooms/${username}/${roomId}`);
                await set(userRoomRef, { updatedAt: now });
            }
        },
        [roomId]
    );

    return { roomData, isConnected, updateLocation, registerRoom };
}

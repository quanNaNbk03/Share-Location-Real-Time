import { useState, useEffect, useRef } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../lib/firebase';
import type { RoomData } from './useRoom';

export interface HistoryRoom {
  id: string;
  updatedAt: number;
  roomData: RoomData | null;
}

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export function useRoomHistory(username: string | null) {
  const [historyRooms, setHistoryRooms] = useState<HistoryRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!username || !db) {
      setHistoryRooms([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Timeout fallback: nếu Firebase không phản hồi sau 8s, tắt loading
    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        console.warn('[useRoomHistory] Timeout - Firebase không phản hồi');
        setLoading(false);
      }
    }, 8000);

    const userRoomsRef = ref(db, `user_rooms/${username}`);

    const unsubscribe = onValue(
      userRoomsRef,
      async (snapshot) => {
        clearTimeout(timeoutId);
        if (!mountedRef.current) return;

        try {
          if (!snapshot.exists()) {
            setHistoryRooms([]);
            setLoading(false);
            return;
          }

          const userRoomsData = snapshot.val() as Record<string, { updatedAt: number }>;

          const validRoomIds = Object.entries(userRoomsData)
            .filter(([, v]) => v.updatedAt && Date.now() - v.updatedAt < THREE_HOURS_MS)
            .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
            .map(([roomId, v]) => ({ roomId, updatedAt: v.updatedAt }));

          if (validRoomIds.length === 0) {
            setHistoryRooms([]);
            setLoading(false);
            return;
          }

          const roomsWithData = await Promise.all(
            validRoomIds.map(async ({ roomId, updatedAt }) => {
              if (!db) return { id: roomId, updatedAt, roomData: null };
              try {
                const roomSnap = await get(ref(db, `rooms/${roomId}`));
                return {
                  id: roomId,
                  updatedAt,
                  roomData: roomSnap.exists() ? (roomSnap.val() as RoomData) : null,
                };
              } catch {
                return { id: roomId, updatedAt, roomData: null };
              }
            })
          );

          if (mountedRef.current) {
            setHistoryRooms(roomsWithData);
            setLoading(false);
          }
        } catch (err) {
          console.error('[useRoomHistory] Lỗi xử lý dữ liệu:', err);
          if (mountedRef.current) {
            setHistoryRooms([]);
            setLoading(false);
          }
        }
      },
      // Error callback — Firebase permission denied hoặc lỗi mạng
      (error) => {
        clearTimeout(timeoutId);
        console.error('[useRoomHistory] Firebase error:', error.message);
        if (mountedRef.current) {
          setHistoryRooms([]);
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [username]);

  return { historyRooms, loading };
}


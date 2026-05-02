import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { STORAGE_KEYS } from '../constants';

interface Notification {
  id: string;
  type: 'deadline' | 'task' | 'message' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export function useNotifications() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;

    let mounted = true;
    let s: Socket | null = null;

    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!mounted || !data.success || !data.user) return;

        s = io(window.location.origin, {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        s.on('connect', () => {
          s!.emit('join-lawyer', data.user.id);
        });

        s.on('deadline-alert', (data: any) => {
          const notification: Notification = {
            id: `deadline-${Date.now()}`,
            type: 'deadline',
            title: data.title || 'Prazo Próximo!',
            message: data.message,
            data: data.deadline,
            read: false,
            createdAt: new Date()
          };
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          playNotificationSound();
        });

        s.on('connect_error', (err: Error) => {
          console.error('Socket connection error:', err.message);
        });

        socketRef.current = s;
        setSocket(s);
      })
      .catch(err => console.error('Error setting up notifications:', err));

    return () => {
      mounted = false;
      if (s) {
        s.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notif = prev.find(n => n.id === id);
      if (notif && !notif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    socket
  };
}

function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, 200);
  } catch {
    // Silently fail
  }
}

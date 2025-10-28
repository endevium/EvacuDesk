import { useEffect } from 'react';
import { toast } from 'react-toastify';
import socket from '../socket';

const VAPID_PUBLIC_KEY = 'BNjOeGzU4I84a4vn9OnPnv1dVYj5XvCskv8cpiVjWwsnFsUJ9x5PXMTWIbTdqKJqVzC9tYaIKapX3NsbyAY6nuo'; 

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const raw = atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

export default function useNotificationSetup(user) {
  useEffect(() => {
    if (!user || !user._id || !user.role) return;

    // Register with socket.io
    socket.emit('register', {
      userId: user._id,
      role: user.role,
    });

    console.log('Registering user on socket:', user._id);

    // Listen for socket.io notifications
    socket.on('notification', (data) => {
      console.log('📩 Socket notification received:', data);
      toast(`${data.title}: ${data.body}`, {
        position: 'top-right',
        type: 'info',
        autoClose: 5000,
      });
    });

    // Ask permission & subscribe to push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
              }).then(subscription => {
                // Save to backend
                fetch('http://localhost:3000/push-subscription', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: user._id,
                    role: user.role,
                    subscription
                  })
                }).catch(console.error);
              }).catch(console.error);
            }
          });
        });
    }

    return () => {
      socket.off('notification');
    };
  }, [user]);
}
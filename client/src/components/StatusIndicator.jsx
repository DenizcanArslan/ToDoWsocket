"use client";

import { useState, useEffect } from 'react';
import socket from '@/lib/socket';

export default function StatusIndicator() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleUsersCount = (count) => {
      console.log('📊 Aktif kullanıcı sayısı:', count);
      setActiveUsers(count);
    };

    const handleConnect = () => {
      setIsConnected(true);
      // Bağlantı kurulduğunda kullanıcı sayısını iste
      socket.emit('ping:users');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNotification = (data) => {
      console.log('🔔 Bildirim:', data);
      setNotification(data);
      
      // 3 saniye sonra bildirimi temizle
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    };

    // Event listener'ları ekle
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('users:count', handleUsersCount);
    socket.on('notification', handleNotification);

    // Bağlantı durumunu kontrol et
    setIsConnected(socket.connected);
    
    // Eğer zaten bağlıysa kullanıcı sayısını iste
    if (socket.connected) {
      socket.emit('ping:users');
    }

    // Temizleme fonksiyonu
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('users:count', handleUsersCount);
      socket.off('notification', handleNotification);
    };
  }, []); // Sadece bir kez çalıştır

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {/* Bildirim alanı */}
      {notification && (
        <div 
          className={`p-3 rounded-lg shadow-lg text-white mb-2 transition-opacity ease-in-out duration-300 ${
            notification.type === 'add' ? 'bg-green-500' : 
            notification.type === 'toggle' ? 'bg-yellow-500' : 
            notification.type === 'delete' ? 'bg-red-500' : 'bg-blue-500'
          }`}
        >
          {notification.message}
        </div>
      )}
      
      {/* Socket durumu ve kullanıcı sayısı */}
      <div className="bg-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-700">
              {isConnected ? 'Bağlı' : 'Bağlantı kesik'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <span className="text-sm text-gray-700 font-medium">
              {activeUsers} aktif kullanıcı
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
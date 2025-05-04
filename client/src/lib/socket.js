import { io } from "socket.io-client";

// Socket sunucu adresini ortam değişkenlerinden al
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

// Socket bağlantısı için gerekli ayarlar
const getSocketOptions = () => {
  return {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 5000,
    transports: ['websocket', 'polling'],
  };
};

// Tek bir soket bağlantısı oluştur ve yönet
class SocketManager {
  constructor() {
    this.socket = null;
    this.init();
  }

  init() {
    if (this.socket) return;

    console.log(`🔌 Socket.IO sunucusuna bağlanılıyor: ${SOCKET_URL}`);
    // Socket bağlantısını oluştur
    this.socket = io(SOCKET_URL, getSocketOptions());

    // Bağlantı durumu değişikliklerini logla
    this.socket.on("connect", () => {
      console.log("✅ Socket.IO bağlantısı kuruldu:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO bağlantısı kesildi:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔴 Socket.IO bağlantı hatası:", error.message);
    });

    // Sayfa kapatıldığında bağlantıyı düzgün şekilde sonlandır
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
    }
  }

  // Bağlantıyı kapat
  disconnect() {
    if (this.socket && this.socket.connected) {
      console.log("🔌 Socket bağlantısı kapatılıyor...");
      this.socket.disconnect();
    }
  }

  // Bağlantıyı yeniden kur
  connect() {
    if (this.socket && !this.socket.connected) {
      console.log("🔄 Socket bağlantısı yeniden kuruluyor...");
      this.socket.connect();
    }
  }

  // Socket nesnesini getir
  getSocket() {
    if (!this.socket) {
      this.init();
    }
    return this.socket;
  }
}

// Singleton instance oluştur
const socketManager = new SocketManager();

// Socket nesnesini export et
const socket = socketManager.getSocket();

export default socket; 
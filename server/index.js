const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Ortam değişkenlerini yükle
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 3001;

// CORS yapılandırması
app.use(cors({
  origin: [CLIENT_URL, 'https://your-vercel-app.vercel.app'], // Vercel URL'inizi ekleyin
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

// Status endpoint
app.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeConnections: activeSockets.size,
    uptime: Math.floor(process.uptime())
  });
});

// Socket.IO ile server oluşturma
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'https://your-vercel-app.vercel.app'], // Vercel URL'inizi ekleyin
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  },
  // Bağlantı temizleme ayarları
  pingTimeout: 5000,
  pingInterval: 5000,
  connectTimeout: 10000
});

// Aktif soketleri saklayacağımız set
const activeSockets = new Set();

// Aktif kullanıcı sayısını güncelle
const updateActiveUserCount = () => {
  const count = activeSockets.size;
  console.log(`🟢 Aktif kullanıcı sayısı: ${count}`);
  console.log(`🔵 Aktif soketler: ${Array.from(activeSockets).join(', ')}`);
  
  // Tüm istemcilere aktif kullanıcı sayısını gönder
  io.emit('users:count', count);
  return count;
};

// Socket bağlantılarını yönet
io.on('connection', (socket) => {
  // Soketi aktifler arasına ekle
  activeSockets.add(socket.id);
  console.log(`➕ Yeni bağlantı: ${socket.id}`);
  
  // Aktif kullanıcı sayısını güncelle
  updateActiveUserCount();
  
  // Kullanıcı kendi bağlantısını kontrol ettiğinde
  socket.on('ping:users', () => {
    socket.emit('users:count', activeSockets.size);
  });
  
  // Görev ekleme
  socket.on('todo:add', (todo) => {
    console.log(`✏️ Görev eklendi: ${todo.text}`);
    socket.broadcast.emit('todo:added', todo);
    socket.broadcast.emit('notification', {
      type: 'add',
      message: 'Yeni görev eklendi'
    });
  });
  
  // Görev durumu değiştirme
  socket.on('todo:toggle', (todo) => {
    console.log(`🔄 Görev durumu değişti: ID ${todo.id}`);
    socket.broadcast.emit('todo:toggled', todo);
    socket.broadcast.emit('notification', {
      type: 'toggle',
      message: 'Bir görev güncellendi'
    });
  });
  
  // Görev silme
  socket.on('todo:delete', (todoId) => {
    console.log(`🗑️ Görev silindi: ID ${todoId}`);
    socket.broadcast.emit('todo:deleted', todoId);
    socket.broadcast.emit('notification', {
      type: 'delete',
      message: 'Bir görev silindi'
    });
  });
  
  // Bağlantı koptuğunda
  socket.on('disconnect', (reason) => {
    // Soketi aktiflerden çıkar
    activeSockets.delete(socket.id);
    console.log(`➖ Bağlantı kapandı: ${socket.id} (${reason})`);
    
    // Aktif kullanıcı sayısını güncelle
    updateActiveUserCount();
  });
});

// Belirli aralıklarla bağlantı durumlarını kontrol et
const cleanupInterval = setInterval(() => {
  let cleanedCount = 0;
  
  // io.sockets.sockets, Map tipinde bir koleksiyon
  io.sockets.sockets.forEach((socket, id) => {
    if (!socket.connected) {
      activeSockets.delete(id);
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`🧹 ${cleanedCount} eski bağlantı temizlendi`);
    updateActiveUserCount();
  }
}, 10000); // Her 10 saniyede bir kontrol

// Server kapatıldığında interval'i durdur
process.on('SIGINT', () => {
  clearInterval(cleanupInterval);
  console.log('Server kapatılıyor, interval durduruldu');
  process.exit(0);
});

// Server'ı başlat
server.listen(PORT, () => {
  console.log(`⚡ Socket.IO server ${PORT} portunda çalışıyor`);
  console.log(`📡 Client URL: ${CLIENT_URL}`);
}); 
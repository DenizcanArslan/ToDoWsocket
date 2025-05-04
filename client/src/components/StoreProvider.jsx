"use client";

import { Provider } from 'react-redux';
import { useEffect } from 'react';
import store from '@/store/store';
import socket from '@/lib/socket';
import { socketTodoAdded, socketTodoToggled, socketTodoDeleted } from '@/store/todoSlice';

function SocketHandler() {
  useEffect(() => {
    // Socket.io dinleyicileri
    socket.on('todo:added', (todo) => {
      store.dispatch(socketTodoAdded(todo));
    });

    socket.on('todo:toggled', (todo) => {
      store.dispatch(socketTodoToggled(todo));
    });

    socket.on('todo:deleted', (todoId) => {
      store.dispatch(socketTodoDeleted(todoId));
    });

    return () => {
      // Komponent unmount olduğunda dinleyicileri temizle
      socket.off('todo:added');
      socket.off('todo:toggled');
      socket.off('todo:deleted');
    };
  }, []);

  return null;
}

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <SocketHandler />
      {children}
    </Provider>
  );
} 
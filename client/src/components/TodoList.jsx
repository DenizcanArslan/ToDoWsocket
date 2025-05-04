"use client";

import { useSelector } from 'react-redux';
import { selectTodos, selectStatus } from '@/store/todoSlice';
import TodoItem from './TodoItem';

export default function TodoList() {
  const todos = useSelector(selectTodos);
  const status = useSelector(selectStatus);
  const isLoading = status === 'loading';

  if (isLoading && todos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Görevler yükleniyor...
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Henüz görev eklenmedi
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
} 
"use client";

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTodo, selectStatus } from '@/store/todoSlice';

export default function TodoForm() {
  const [text, setText] = useState('');
  const dispatch = useDispatch();
  const status = useSelector(selectStatus);
  const isLoading = status === 'loading';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      await dispatch(createTodo(text.trim()));
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Yeni görev ekle..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className={`px-4 py-2  rounded-lg transition-colors cursor-pointer text-white shadow-none border-0 outline-none ${
            isLoading || !text.trim() 
              ? 'bg-blue-300' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Ekleniyor...' : 'Ekle'}
        </button>
      </div>
    </form>
  );
} 
"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import TodoList from "@/components/TodoList";
import TodoForm from "@/components/TodoForm";
import { selectTodos, selectStatus, selectError, fetchTodos } from '@/store/todoSlice';

export default function Home() {
  const todos = useSelector(selectTodos);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">To Do App</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span>{error}</span>
        </div>
      )}
      
      <TodoForm />
      
      {status === 'loading' && <p className="text-center py-4">Yükleniyor...</p>}
      
      <TodoList />
    </div>
  );
}

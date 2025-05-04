import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import socket from '@/lib/socket';

// Async action to fetch todos
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Görevler yüklenemedi');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue('Görevler yüklenemedi');
    }
  }
);

// Async action to add todo
export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async (text, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Görev eklenemedi');
      }
      
      const newTodo = await response.json();
      
      // Socket.io ile diğer kullanıcılara bildirim gönderme
      socket.emit('todo:add', newTodo);
      
      return newTodo;
    } catch (error) {
      return rejectWithValue('Görev eklenemedi');
    }
  }
);

// Async action to toggle todo
export const updateTodoStatus = createAsyncThunk(
  'todos/updateTodoStatus',
  async ({ id, completed }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Görev güncellenemedi');
      }
      
      const updatedTodo = await response.json();
      
      // Socket.io ile diğer kullanıcılara bildirim gönderme
      socket.emit('todo:toggle', updatedTodo);
      
      return updatedTodo;
    } catch (error) {
      return rejectWithValue('Görev güncellenemedi');
    }
  }
);

// Async action to delete todo
export const removeTodo = createAsyncThunk(
  'todos/removeTodo',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Görev silinemedi');
      }
      
      // Socket.io ile diğer kullanıcılara bildirim gönderme
      socket.emit('todo:delete', id);
      
      return id;
    } catch (error) {
      return rejectWithValue('Görev silinemedi');
    }
  }
);

const initialState = {
  todos: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Socket.io yoluyla diğer kullanıcılardan gelen güncellemeler için reducer'lar
    socketTodoAdded: (state, action) => {
      state.todos.unshift(action.payload);
    },
    socketTodoToggled: (state, action) => {
      const index = state.todos.findIndex(todo => todo.id === action.payload.id);
      if (index !== -1) {
        state.todos[index] = action.payload;
      }
    },
    socketTodoDeleted: (state, action) => {
      state.todos = state.todos.filter(todo => todo.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch todos
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.todos = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create todo
      .addCase(createTodo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.todos.unshift(action.payload);
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update todo
      .addCase(updateTodoStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTodoStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      })
      .addCase(updateTodoStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Delete todo
      .addCase(removeTodo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeTodo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.todos = state.todos.filter(todo => todo.id !== action.payload);
      })
      .addCase(removeTodo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { socketTodoAdded, socketTodoToggled, socketTodoDeleted } = todoSlice.actions;

export const selectTodos = (state) => state.todos.todos;
export const selectStatus = (state) => state.todos.status;
export const selectError = (state) => state.todos.error;

export default todoSlice.reducer; 
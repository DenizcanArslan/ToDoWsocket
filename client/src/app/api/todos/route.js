import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Tüm görevleri getir
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Görevler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni görev oluştur
export async function POST(request) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json(
        { error: 'Görev metni gereklidir' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        text: text.trim(),
      }
    });
    
    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Görev oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
} 
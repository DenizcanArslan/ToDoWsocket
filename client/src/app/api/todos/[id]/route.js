import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Görevi güncelleme (tamamlandı/tamamlanmadı)
export async function PATCH(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    const existingTodo = await prisma.todo.findUnique({
      where: { id }
    });

    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Görev bulunamadı' },
        { status: 404 }
      );
    }

    const { completed } = await request.json();
    
    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Tamamlandı durumu boolean olmalıdır' },
        { status: 400 }
      );
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { completed }
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Görev güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Görevi silme
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    const existingTodo = await prisma.todo.findUnique({
      where: { id }
    });

    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Görev bulunamadı' },
        { status: 404 }
      );
    }

    await prisma.todo.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Görev silinirken hata oluştu' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'personal') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { alunoId, name, durationTime, day, exercicios } = body;

    if (!alunoId || !name || !durationTime || !day || !exercicios?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const treino = await prisma.treino.create({
      data: {
        name,
        durationTime,
        day: new Date(day),
        aluno: { connect: { id: alunoId } },
        personal: { connect: { id: user.id } },
        exercicios: {
          create: exercicios.map((ex: any) => ({
            name: ex.name,
            sections: {
              create: ex.sections.map((sec: any) => ({
                carga: parseFloat(sec.carga) || 0,
                series: parseInt(sec.series) || 0,
                reps: parseInt(sec.reps) || 0,
                equip: sec.equip || '',
                rpe: parseFloat(sec.rpe) || 0,
                pr: parseFloat(sec.pr) || 0,
                feito: !!sec.feito,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json({ message: 'Treino criado com sucesso!', treino });
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = await verifyToken(token);
    if (!user || user.role !== 'personal') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, durationTime, day, exercicios } = body;

    if (!id || !exercicios) {
      return NextResponse.json({ error: 'Missing treino ID or exercises' }, { status: 400 });
    }

    await prisma.treino.update({
      where: { id },
      data: {
        name,
        durationTime,
        day: new Date(day),
      },
    });

    for (const ex of exercicios) {
      let exId = ex.id;

      const exists = exId ? await prisma.exercicio.findUnique({ where: { id: exId } }) : null;

      if (exists) {
        await prisma.exercicio.update({
          where: { id: exId },
          data: { name: ex.name },
        });
      } else {
        const newEx = await prisma.exercicio.create({
          data: {
            name: ex.name,
            treino: { connect: { id } },
          },
        });
        exId = newEx.id;
      }

      for (const sec of ex.sections) {
        const secExists = sec.id ? await prisma.sections.findUnique({ where: { id: sec.id } }) : null;

        if (secExists) {
          await prisma.sections.update({
            where: { id: sec.id },
            data: {
              carga: parseFloat(sec.carga) || 0,
              series: parseInt(sec.series) || 0,
              reps: parseInt(sec.reps) || 0,
              equip: sec.equip || '',
              rpe: parseFloat(sec.rpe) || 0,
              pr: parseFloat(sec.pr) || 0,
              feito: !!sec.feito,
            },
          });
        } else {
          await prisma.sections.create({
            data: {
              carga: parseFloat(sec.carga) || 0,
              series: parseInt(sec.series) || 0,
              reps: parseInt(sec.reps) || 0,
              equip: sec.equip || '',
              rpe: parseFloat(sec.rpe) || 0,
              pr: parseFloat(sec.pr) || 0,
              feito: !!sec.feito,
              exercicio: {
                connect: { id: exId },
              },
            },
          });
        }
      }
    }

    return NextResponse.json({ message: 'Treino atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar treino:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'personal') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const alunoId = searchParams.get('alunoId');
    const treinoId = searchParams.get('treinoId');

    if (treinoId) {
      const treino = await prisma.treino.findUnique({
        where: {
          id: treinoId,
          personalId: user.id,
        },
        include: {
          exercicios: {
            include: {
              sections: true,
            },
          },
        },
      });

      if (!treino) {
        return NextResponse.json({ error: 'Treino não encontrado' }, { status: 404 });
      }

      return NextResponse.json(treino);
    }

    if (!alunoId) {
      return NextResponse.json({ error: 'Missing alunoId in query' }, { status: 400 });
    }

    const treinos = await prisma.treino.findMany({
      where: {
        alunoId,
        personalId: user.id,
      },
      orderBy: { day: 'desc' },
      include: {
        exercicios: {
          include: {
            sections: true,
          },
        },
      },
    });

    return NextResponse.json({ treinos });
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

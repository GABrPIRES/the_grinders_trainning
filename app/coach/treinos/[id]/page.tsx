"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
  ArrowLeft, Plus, Calendar,
  TrendingUp, Clock, CheckCircle2, ChevronRight,
} from "lucide-react";

interface TrainingBlock {
  id: string;
  name: string;
  objective: string;
  title: string;
  start_date: string;
  end_date: string;
  status?: 'active' | 'completed' | 'future';
  weeks_count?: number;
}

interface Student {
  id: string;
  name: string;
  user?: { name: string };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BlocksSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-surface-elevated border border-line rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-5 bg-surface-subtle rounded-full w-28"></div>
            <div className="h-4 bg-surface-subtle rounded w-36"></div>
          </div>
          <div className="h-6 bg-surface-subtle rounded w-52"></div>
          <div className="h-4 bg-surface-subtle rounded w-32"></div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CoachStudentBlocksPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [studentData, blocksData] = await Promise.all([
          fetchWithAuth(`alunos/${id}`),
          fetchWithAuth(`alunos/${id}/training_blocks`),
        ]);
        setStudent(studentData);
        const sortedBlocks = (Array.isArray(blocksData) ? blocksData : []).sort((a: any, b: any) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        setBlocks(sortedBlocks);
      } catch (error) {
        console.error("Erro ao carregar blocos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const formatDate = (date: string) => {
    if (!date) return "--/--";
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  };

  const getStatus = (block: TrainingBlock) => {
    const today = new Date().toISOString().split('T')[0];
    if (today >= block.start_date && today <= block.end_date) return 'active';
    if (today > block.end_date) return 'completed';
    return 'future';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border">
            <TrendingUp size={12} /> Em Andamento
          </span>
        );
      case 'future':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-semantic-info-bg text-semantic-info-text border border-semantic-info-border">
            <Clock size={12} /> Futuro
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-surface-subtle text-content-muted border border-line">
            <CheckCircle2 size={12} /> Concluído
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 md:pb-8 text-content-primary">

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/coach/treinos')}
            className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-content-primary">Periodização</h1>
            <p className="text-sm text-content-tertiary">
              Aluno:{" "}
              <span className="font-bold text-content-secondary">
                {student?.name || student?.user?.name || "Carregando..."}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/coach/treinos/${id}/blocks/create`)}
          className="bg-brand text-content-on-brand px-5 py-2.5 rounded-xl font-bold hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus size={18} /> Novo Bloco
        </button>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <BlocksSkeleton />
      ) : blocks.length === 0 ? (
        <div className="bg-surface-subtle border-2 border-dashed border-line rounded-xl p-12 text-center flex flex-col items-center">
          <Calendar size={48} className="text-content-muted mb-4" />
          <h3 className="text-lg font-bold text-content-primary mb-1">Nenhum bloco criado</h3>
          <p className="text-sm text-content-tertiary mb-6 max-w-md">
            Crie o primeiro bloco de treinamento para começar a prescrever os treinos deste aluno.
          </p>
          <button
            onClick={() => router.push(`/coach/treinos/${id}/blocks/create`)}
            className="text-brand font-bold hover:underline"
          >
            Criar primeiro bloco
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {blocks.map((block) => {
            const status = getStatus(block);
            return (
              <div
                key={block.id}
                onClick={() => router.push(`/coach/treinos/${id}/blocks/${block.id}`)}
                className={`
                  relative bg-surface-elevated p-6 rounded-xl border transition-all cursor-pointer group shadow-sm
                  ${status === 'active'
                    ? 'border-semantic-success-border shadow-md'
                    : 'border-line hover:border-brand/30 hover:shadow-md'
                  }
                `}
              >
                {/* Indicador lateral de status */}
                <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${
                  status === 'completed' ? 'bg-semantic-success-text' : 'bg-brand'
                }`} />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(status)}
                      <span className="text-xs text-content-muted font-mono uppercase tracking-wide">
                        {formatDate(block.start_date)} — {formatDate(block.end_date)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-content-primary group-hover:text-brand transition-colors">
                      {block.title}
                    </h3>
                    <p className="text-content-tertiary text-sm mt-1 line-clamp-1">
                      Objetivo: {block.objective || "Geral"}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-line pt-4 md:pt-0 mt-2 md:mt-0">
                    <div className="text-center md:text-right">
                      <p className="text-xs text-content-muted uppercase font-bold">Duração</p>
                      <p className="font-bold text-content-primary">
                        {block.weeks_count ||
                          Math.round(
                            (new Date(block.end_date).getTime() - new Date(block.start_date).getTime()) /
                            (7 * 24 * 60 * 60 * 1000)
                          )}{" "}
                        Semanas
                      </p>
                    </div>
                    <button className="p-2 rounded-lg bg-surface-subtle group-hover:bg-surface-page text-content-muted group-hover:text-brand transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

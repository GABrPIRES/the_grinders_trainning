"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import {
  UploadCloud, Loader2, AlertCircle, CheckCircle2,
  ChevronRight, User, Calendar,
} from "lucide-react";
import ImportPreviewCarousel, { type ParsedData } from "@/components/import/ImportPreviewCarousel";

interface Aluno { id: string; user: { name: string }; }
interface TrainingBlock { id: string; title: string; }

export default function ImportTreinoPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState('');
  const [blocos, setBlocos] = useState<TrainingBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [loadingAlunos, setLoadingAlunos] = useState(true);
  const [loadingBlocos, setLoadingBlocos] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const data = await fetchWithAuth('alunos?limit=10000');
        setAlunos(data.alunos || []);
      } catch {
        setUploadError("Falha ao carregar a lista de alunos.");
      } finally {
        setLoadingAlunos(false);
      }
    };
    fetchAlunos();
  }, []);

  useEffect(() => {
    if (!selectedAlunoId) { setBlocos([]); setSelectedBlockId(''); return; }
    const fetchBlocos = async () => {
      try {
        setLoadingBlocos(true);
        setUploadError(null);
        const data = await fetchWithAuth(`alunos/${selectedAlunoId}/training_blocks`);
        setBlocos(data || []);
      } catch {
        setUploadError("Falha ao carregar blocos deste aluno.");
      } finally {
        setLoadingBlocos(false);
      }
    };
    fetchBlocos();
  }, [selectedAlunoId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setParsedData([]);
    setUploadError(null);
  };

  const handleUploadAndParse = async () => {
    if (!selectedBlockId || !files || files.length === 0) {
      setUploadError("Selecione um aluno, um bloco e pelo menos um arquivo.");
      return;
    }
    if (files.length > 5) { setUploadError("Máximo de 5 arquivos."); return; }

    setIsUploading(true);
    setUploadError(null);
    setParsedData([]);

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files[]', file));

    try {
      const response = await fetchWithAuth(`alunos/${selectedAlunoId}/import_training_block`, {
        method: 'POST', body: formData, headers: {},
      });
      setParsedData(response.parsed_data || []);
      if (response.errors?.length > 0) setUploadError(`Problemas: ${response.errors.join(', ')}`);
      else if (!response.parsed_data?.length) setUploadError("Nenhum dado válido encontrado nas planilhas.");
    } catch (err: any) {
      setUploadError(err.message || "Erro desconhecido durante o upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearImport = () => {
    setParsedData([]);
    setFiles(null);
    setUploadError(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const selectClass = "w-full pl-10 pr-4 py-2.5 border border-line-input rounded-lg appearance-none bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all cursor-pointer disabled:bg-surface-subtle disabled:text-content-muted text-sm";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Importação em Massa</h1>
        <p className="text-sm text-content-tertiary mt-0.5">Carregue planilhas Excel (.xlsx) para criar treinos automaticamente.</p>
      </div>

      {/* Passos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Passo 1: Aluno */}
        <div className={`bg-surface-elevated border rounded-2xl p-6 shadow-sm transition-all ${selectedAlunoId ? 'border-brand' : 'border-line'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${selectedAlunoId ? 'bg-brand text-content-on-brand' : 'bg-surface-subtle text-content-muted'}`}>1</div>
            <h2 className="font-bold text-content-primary">Selecione o Aluno</h2>
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
            <select
              value={selectedAlunoId}
              onChange={e => { setSelectedAlunoId(e.target.value); setParsedData([]); setUploadError(null); }}
              className={selectClass}
              disabled={loadingAlunos || isUploading}
            >
              <option value="">Escolha...</option>
              {alunos.map(a => <option key={a.id} value={a.id}>{a.user.name}</option>)}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" size={15} />
          </div>
        </div>

        {/* Passo 2: Bloco */}
        <div className={`bg-surface-elevated border rounded-2xl p-6 shadow-sm transition-all ${selectedBlockId ? 'border-brand' : 'border-line'} ${!selectedAlunoId ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${selectedBlockId ? 'bg-brand text-content-on-brand' : 'bg-surface-subtle text-content-muted'}`}>2</div>
            <h2 className="font-bold text-content-primary">Bloco de Destino</h2>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
            <select
              value={selectedBlockId}
              onChange={e => { setSelectedBlockId(e.target.value); setParsedData([]); setUploadError(null); }}
              className={selectClass}
              disabled={!selectedAlunoId || loadingBlocos || isUploading}
            >
              <option value="">Escolha o bloco...</option>
              {blocos.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" size={15} />
          </div>
          {blocos.length === 0 && selectedAlunoId && !loadingBlocos && (
            <p className="text-xs text-semantic-error-text mt-2">Este aluno não possui blocos criados.</p>
          )}
        </div>

        {/* Passo 3: Upload */}
        <div className={`bg-surface-elevated border rounded-2xl p-6 shadow-sm transition-all ${files && files.length > 0 ? 'border-brand' : 'border-line'} ${!selectedBlockId ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${files && files.length > 0 ? 'bg-brand text-content-on-brand' : 'bg-surface-subtle text-content-muted'}`}>3</div>
            <h2 className="font-bold text-content-primary">Upload de Arquivos</h2>
          </div>
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-line rounded-xl cursor-pointer hover:bg-surface-subtle hover:border-brand transition-all group"
          >
            <UploadCloud className="w-7 h-7 mb-2 text-content-muted group-hover:text-brand transition-colors" />
            <p className="text-xs text-content-muted group-hover:text-brand transition-colors">
              {files && files.length > 0 ? `${files.length} arquivo(s) selecionado(s)` : "Clique para selecionar XLSX"}
            </p>
            <input
              id="file-upload" type="file" multiple
              accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              disabled={!selectedBlockId || isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Botão processar */}
      <div className="flex flex-col items-center justify-center pt-2 border-t border-line">
        {uploadError && (
          <div className="bg-semantic-error-bg border border-semantic-error-border text-semantic-error-text px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm w-full max-w-lg">
            <AlertCircle size={16} className="flex-shrink-0" /> {uploadError}
          </div>
        )}
        <button
          onClick={handleUploadAndParse}
          disabled={!selectedBlockId || !files || files.length === 0 || isUploading}
          className="bg-brand text-content-on-brand px-8 py-3.5 rounded-xl font-bold hover:bg-brand-hover disabled:bg-surface-subtle disabled:text-content-muted disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          {isUploading ? (
            <><Loader2 className="animate-spin" size={18} /> Processando Planilhas...</>
          ) : (
            <><CheckCircle2 size={18} /> Processar e Revisar</>
          )}
        </button>
      </div>

      {/* Preview */}
      {parsedData.length > 0 && !isUploading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ImportPreviewCarousel
            initialData={parsedData}
            alunoId={selectedAlunoId}
            targetBlockId={selectedBlockId}
            onSaveSuccess={clearImport}
            onCancel={clearImport}
          />
        </div>
      )}
    </div>
  );
}

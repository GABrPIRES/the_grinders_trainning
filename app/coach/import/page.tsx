"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { UploadCloud, Loader, AlertCircle } from "lucide-react";
import ImportPreviewCarousel, { 
  type ParsedData 
} from "@/components/import/ImportPreviewCarousel"; // Ajuste o caminho se necessário

// Interfaces
interface Aluno {
  id: string;
  user: { name: string; };
}
interface TrainingBlock {
  id: string;
  title: string;
}

export default function ImportTreinoPage() {
  const router = useRouter();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>('');
  
  // Novos estados para os blocos
  const [blocos, setBlocos] = useState<TrainingBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [loadingAlunos, setLoadingAlunos] = useState(true);
  const [loadingBlocos, setLoadingBlocos] = useState(false);
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 1. Busca alunos
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        setLoadingAlunos(true);
        const data = await fetchWithAuth('alunos'); 
        setAlunos(data.alunos || []);
      } catch (err) {
        setUploadError("Falha ao carregar a lista de alunos.");
      } finally {
        setLoadingAlunos(false);
      }
    };
    fetchAlunos();
  }, []);

  // 2. Busca os blocos do aluno selecionado
  useEffect(() => {
    if (!selectedAlunoId) {
      setBlocos([]);
      setSelectedBlockId('');
      return;
    }
    const fetchBlocos = async () => {
      try {
        setLoadingBlocos(true);
        setUploadError(null);
        const data = await fetchWithAuth(`alunos/${selectedAlunoId}/training_blocks`);
        setBlocos(data || []);
      } catch (err) {
        setUploadError("Falha ao carregar blocos deste aluno.");
      } finally {
        setLoadingBlocos(false);
      }
    };
    fetchBlocos();
  }, [selectedAlunoId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
    setParsedData([]);
    setUploadError(null);
  };

  const handleUploadAndParse = async () => {
    if (!selectedBlockId || !files || files.length === 0) {
      setUploadError("Selecione um aluno, um bloco e pelo menos um arquivo.");
      return;
    }
    if (!selectedAlunoId || !files || files.length === 0) {
      setUploadError("Selecione um aluno e pelo menos um arquivo.");
      return;
    }
    if (files.length > 5) {
        setUploadError("Você pode selecionar no máximo 5 arquivos.");
        return;
    }

    setIsUploading(true);
    setUploadError(null);
    setParsedData([]); 
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files[]', file);
    });
    try {
      const response = await fetchWithAuth(`alunos/${selectedAlunoId}/import_training_block`, {
        method: 'POST',
        body: formData,
        headers: { } // Deixado em branco para o FormData
      });
      setParsedData(response.parsed_data || []); 
      if(response.errors && response.errors.length > 0){
         setUploadError(`Alguns arquivos tiveram problemas: ${response.errors.join(', ')}`);
      }
      if (response.parsed_data && response.parsed_data.length > 0) {
         console.log("Dados parseados:", response.parsed_data);
      } else if (!response.errors || response.errors.length === 0) {
         setUploadError("Nenhum dado válido foi encontrado nos arquivos.");
      }
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

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800 space-y-8">
      <h1 className="text-2xl font-bold border-b pb-4">Importar Treinos de Planilha</h1>
      {/* Passo 1: Selecionar Aluno */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <label htmlFor="alunoSelect" className="block text-lg font-semibold mb-2">1. Selecione o Aluno</label>
        {loadingAlunos ? (
          <p className="text-sm text-neutral-500">Carregando alunos...</p>
        ) : (
          <select
            id="alunoSelect"
            value={selectedAlunoId}
            onChange={(e) => {
              setSelectedAlunoId(e.target.value);
              setParsedData([]); // Limpa preview se trocar aluno
              setUploadError(null);
            }}
            className="w-full border p-2 rounded text-neutral-600 disabled:bg-neutral-100"
            disabled={alunos.length === 0 || isUploading}
          >
            <option value="">-- Escolha um aluno --</option>
            {alunos.map(aluno => (
              <option key={aluno.id} value={aluno.id}>{aluno.user.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className={`bg-white p-4 rounded-lg border shadow-sm ${!selectedAlunoId ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <label htmlFor="blockSelect" className="block text-lg font-semibold mb-2">2. Selecione o Bloco de Destino</label>
        {loadingBlocos ? (
          <p className="text-sm text-neutral-500">Carregando blocos...</p>
        ) : (
          <select
            id="blockSelect"
            value={selectedBlockId}
            onChange={(e) => {
              setSelectedBlockId(e.target.value);
              setParsedData([]); // Limpa preview se trocar bloco
              setUploadError(null);
            }}
            className="w-full border p-2 rounded text-neutral-600 disabled:bg-neutral-100"
            disabled={!selectedAlunoId || loadingBlocos || isUploading}
          >
            <option value="">-- Escolha um bloco existente --</option>
            {blocos.map(block => (
              <option key={block.id} value={block.id}>{block.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Passo 2: Upload */}
      <div className={`bg-white p-4 rounded-lg border shadow-sm ${!selectedAlunoId ? 'opacity-50' : ''}`}>
        <label className="block text-lg font-semibold mb-2">2. Selecione as Planilhas (.xlsx)</label>
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-neutral-400" />
          <input
            id="file-upload"
            type="file"
            multiple // Permite múltiplos arquivos
            accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            disabled={!selectedAlunoId || isUploading}
            className="mt-4 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-neutral-500">Selecione até 5 arquivos XLSX.</p>
        </div>
      </div>

      {/* Botão de Processar */}
      <div className="text-center">
        <button
          onClick={handleUploadAndParse}
          disabled={!selectedAlunoId || !files || files.length === 0 || isUploading || loadingAlunos}
          className="bg-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {isUploading ? (
            <>
              <Loader className="animate-spin mr-2" size={20} /> Processando...
            </>
          ) : (
            "Processar Planilhas"
          )}
        </button>
        {uploadError && (
          <p className="mt-4 text-sm text-red-600 flex items-center justify-center gap-1">
             <AlertCircle size={16} /> {uploadError}
          </p>
        )}
      </div>

      {/* Passo 3: Preview e Edição (será implementado aqui) */}
      {parsedData.length > 0 && !isUploading && (
        <ImportPreviewCarousel 
          initialData={parsedData} 
          alunoId={selectedAlunoId}
          targetBlockId={selectedBlockId} // <-- NOVO PROP
          onSaveSuccess={() => {
            alert("Importação salva com sucesso!");
            clearImport();
            // router.push(`/coach/treinos/${selectedAlunoId}`); 
          }}
          onCancel={clearImport} 
        />
      )}
    </div>
  );
}
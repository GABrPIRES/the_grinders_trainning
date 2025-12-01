"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  UploadCloud, Loader2, AlertCircle, FileSpreadsheet, 
  CheckCircle2, ChevronRight, User, Calendar 
} from "lucide-react";
import ImportPreviewCarousel, { 
  type ParsedData 
} from "@/components/import/ImportPreviewCarousel";

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
  
  const [blocos, setBlocos] = useState<TrainingBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  
  const [loadingAlunos, setLoadingAlunos] = useState(true);
  const [loadingBlocos, setLoadingBlocos] = useState(false);
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
        headers: { } 
      });
      setParsedData(response.parsed_data || []); 
      
      if(response.errors && response.errors.length > 0){
         setUploadError(`Alguns arquivos tiveram problemas: ${response.errors.join(', ')}`);
      } else if (!response.parsed_data || response.parsed_data.length === 0) {
         setUploadError("Nenhum dado válido encontrado nas planilhas.");
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
    <div className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-0 text-neutral-800">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
           <FileSpreadsheet className="text-red-600" /> Importação em Massa
        </h1>
        <p className="text-neutral-500 text-sm">Carregue planilhas Excel (.xlsx) para criar treinos automaticamente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PASSO 1: ALUNO */}
        <div className={`bg-white p-6 rounded-2xl border transition-all ${selectedAlunoId ? 'border-red-500 shadow-md ring-1 ring-green-100' : 'border-neutral-200 shadow-sm'}`}>
           <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${selectedAlunoId ? 'bg-red-700 text-white' : 'bg-neutral-100 text-neutral-500'}`}>1</div>
              <h2 className="font-semibold text-neutral-900">Selecione o Aluno</h2>
           </div>
           
           <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <select
                value={selectedAlunoId}
                onChange={(e) => { setSelectedAlunoId(e.target.value); setParsedData([]); setUploadError(null); }}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all cursor-pointer disabled:bg-neutral-50 disabled:text-neutral-400"
                disabled={loadingAlunos || isUploading}
              >
                <option value="">Escolha...</option>
                {alunos.map(aluno => (
                  <option key={aluno.id} value={aluno.id}>{aluno.user.name}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={16}/>
           </div>
        </div>

        {/* PASSO 2: BLOCO */}
        <div className={`bg-white p-6 rounded-2xl border transition-all ${selectedBlockId ? 'border-red-500 shadow-md ring-1 ring-green-100' : 'border-neutral-200 shadow-sm'} ${!selectedAlunoId ? 'opacity-50 pointer-events-none' : ''}`}>
           <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${selectedBlockId ? 'bg-red-700 text-white' : 'bg-neutral-100 text-neutral-500'}`}>2</div>
              <h2 className="font-semibold text-neutral-900">Bloco de Destino</h2>
           </div>

           <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <select
                value={selectedBlockId}
                onChange={(e) => { setSelectedBlockId(e.target.value); setParsedData([]); setUploadError(null); }}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all cursor-pointer disabled:bg-neutral-50 disabled:text-neutral-400"
                disabled={!selectedAlunoId || loadingBlocos || isUploading}
              >
                <option value="">Escolha o bloco...</option>
                {blocos.map(block => (
                  <option key={block.id} value={block.id}>{block.title}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={16}/>
           </div>
           {blocos.length === 0 && selectedAlunoId && !loadingBlocos && (
              <p className="text-xs text-red-500 mt-2">Este aluno não possui blocos criados.</p>
           )}
        </div>

        {/* PASSO 3: UPLOAD */}
        <div className={`bg-white p-6 rounded-2xl border transition-all ${files && files.length > 0 ? 'border-red-500 shadow-md ring-1 ring-green-100' : 'border-neutral-200 shadow-sm'} ${!selectedBlockId ? 'opacity-50 pointer-events-none' : ''}`}>
           <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${files && files.length > 0 ? 'bg-red-700 text-white' : 'bg-neutral-100 text-neutral-500'}`}>3</div>
              <h2 className="font-semibold text-neutral-900">Upload de Arquivos</h2>
           </div>

           <label 
             htmlFor="file-upload"
             className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:bg-neutral-50 hover:border-red-500 transition-all group"
           >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                 <UploadCloud className="w-8 h-8 mb-2 text-neutral-400 group-hover:text-red-600 transition-colors" />
                 <p className="text-xs text-neutral-500 group-hover:text-red-700">
                    {files && files.length > 0 ? `${files.length} arquivo(s) selecionado(s)` : "Clique para selecionar XLSX"}
                 </p>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                disabled={!selectedBlockId || isUploading}
                className="hidden"
              />
           </label>
        </div>
      </div>

      {/* BOTÃO DE PROCESSAR */}
      <div className="flex flex-col items-center justify-center pt-4 border-t border-neutral-200">
        {uploadError && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm animate-in slide-in-from-top-2 fade-in">
             <AlertCircle size={18} /> {uploadError}
          </div>
        )}
        
        <button
          onClick={handleUploadAndParse}
          disabled={!selectedBlockId || !files || files.length === 0 || isUploading}
          className="bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-red-800 disabled:bg-neutral-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          {isUploading ? (
            <><Loader2 className="animate-spin" size={20} /> Processando Planilhas...</>
          ) : (
            <><CheckCircle2 size={20} /> Processar e Revisar</>
          )}
        </button>
      </div>

      {/* PREVIEW (Componente existente, apenas exibição condicional) */}
      {parsedData.length > 0 && !isUploading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ImportPreviewCarousel 
              initialData={parsedData} 
              alunoId={selectedAlunoId}
              targetBlockId={selectedBlockId}
              onSaveSuccess={() => {
                clearImport();
                // router.push(`/coach/treinos/${selectedAlunoId}`); // Opcional
              }}
              onCancel={clearImport} 
            />
        </div>
      )}
    </div>
  );
}
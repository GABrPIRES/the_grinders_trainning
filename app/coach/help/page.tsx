// app/coach/help/page.tsx

export default function CoachHelpPage() {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded-md text-neutral-800">
        <h1 className="text-2xl font-bold mb-6 border-b pb-4">Central de Ajuda</h1>
  
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Precisa de Suporte?</h2>
            <p className="text-neutral-600">
              Se você encontrou algum problema, tem alguma dúvida ou sugestão para melhorar a plataforma, 
              não hesite em entrar em contato. Estou aqui para ajudar!
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Contatos</h2>
            <ul className="space-y-3 list-disc list-inside text-neutral-700">
              <li>
                <strong>E-mail:</strong> 
                <a href="mailto:gabrielribeiropires@outlook.com" className="text-blue-600 hover:underline ml-2">
                  gabrielribeiropires@outlook.com
                </a>
              </li>
              <li>
                <strong>WhatsApp:</strong> 
                <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                  (11) 97969-9898
                </a>
              </li>
              <li>
                <strong>Instagram:</strong> 
                <a href="https://instagram.com/gabriel_r_pires" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                  @gabriel_r_pires
                </a>
              </li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Perguntas Frequentes (FAQ)</h2>
            <div className="space-y-2 text-neutral-600">
              <p><strong>P: Como eu edito um treino já criado?</strong></p>
              <p>R: Navegue até a tela de treinos, selecione o aluno, clique em "Ver treino" e depois no ícone de lápis para entrar no modo de edição.</p>
              <p><strong>P: Onde eu cadastro meus planos?</strong></p>
              <p>R: No menu lateral, clique em "Plans". Lá você poderá ver, criar, editar e remover seus planos de assinatura.</p>
            </div>
          </section>
        </div>
      </div>
    );
  }
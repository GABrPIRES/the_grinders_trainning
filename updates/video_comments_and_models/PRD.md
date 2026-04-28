# PRD — Vídeos, Comentários e Modelos de Exercício

## Visão Geral

Adicionar recursos de enriquecimento a cada exercício prescrito: links de vídeo do YouTube (privados), comentários opcionais do coach, e a possibilidade de salvar um exercício como modelo reutilizável.

---

## Objetivo

Reduzir o atrito de comunicação entre coach e aluno. O aluno deve poder entender exatamente como executar cada exercício diretamente na plataforma, sem precisar consultar mensagens externas.

---

## Problemas Resolvidos

- **Execução incorreta**: alunos executam exercícios com técnica errada por falta de referência visual
- **Retrabalho de prescrição**: coaches reescrevem manualmente as mesmas cargas/séries para exercícios recorrentes
- **Feedback descontextualizado**: comentários do coach sobre um exercício ficam espalhados em chats externos

---

## Funcionalidades

### 1. Link de Vídeo no Exercício
- Coach pode adicionar 1 ou mais links do YouTube a um exercício
- Vídeos devem ser suportados como **unlisted** (privados) ou públicos
- O aluno vê um botão/ícone de vídeo no exercício que abre um modal ou redireciona para o YouTube
- Um exercício sem vídeo não exibe o ícone

### 2. Comentário do Coach no Exercício
- Campo de texto livre (opcional) associado ao exercício na prescrição
- Diferente do campo de observação do aluno: este vem do coach, é só leitura para o aluno
- Exemplo: "Mantenha o tronco neutro. Se doer o joelho, reduza ADM."
- Exibido abaixo do nome do exercício, em destaque visual separado do campo do aluno

### 3. Salvar Exercício como Modelo
- Coach pode salvar um exercício prescrito como "modelo" com um nome descritivo
- O modelo armazena: nome do exercício, carga, séries, reps, RPE, comentário, links de vídeo
- Na prescrição de novos treinos, o coach pode buscar um modelo e importar os dados automaticamente
- Modelos são específicos por coach (não compartilhados entre coaches)

---

## Não-Escopo (primeira versão)

- Edição de modelos diretamente da prescrição (só salvar e importar)
- Vídeos hospedados no servidor (apenas links externos do YouTube)
- Comentários do aluno em resposta ao coach (isso é o campo de observação atual)

---

## Critérios de Aceitação

| # | Critério |
|---|---------|
| 1 | Coach consegue adicionar link YouTube a um exercício e salvar |
| 2 | Aluno vê botão de vídeo e consegue abrir o YouTube ao clicar |
| 3 | Coach consegue adicionar comentário textual a um exercício |
| 4 | Aluno vê o comentário do coach em destaque, separado do próprio campo de observação |
| 5 | Coach consegue salvar exercício como modelo com nome personalizado |
| 6 | Coach consegue buscar e importar um modelo ao criar/editar exercício |
| 7 | Modelos aparecem apenas para o coach que os criou |

---

## Métricas de Sucesso

- Redução de dúvidas sobre execução de exercícios (proxy: redução em mensagens externas ao coach)
- Adoção de modelos: % de exercícios criados a partir de modelos após 30 dias do lançamento

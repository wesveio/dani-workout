## Diário de Treinos da Dani (POC)

App offline-first em React + TypeScript (Vite + Tailwind + shadcn/ui) para o plano de 12 semanas (3x/semana) da Dani. Visual inspirado no case Movo: cartões arredondados, leve, com verde de destaque.

### Stack
- React + Vite + TypeScript + React Router
- TailwindCSS + shadcn/ui (Radix) + lucide-react
- Zustand (estado) + Dexie (persistência IndexedDB)
- Zod (validação), dayjs (datas), Recharts (gráficos)
- PWA via `vite-plugin-pwa` (funciona offline)

### Dados do programa
- Fonte tipada estática: `src/data/treinoDani.ts` (tipos Program/Phase/Week/SessionTemplate/Exercise + prescrições fixas do plano)
- Helpers: `src/lib/date.ts`, `src/lib/program.ts`
- Store/DB: `src/store/workoutStore.ts`, `src/db/client.ts`

### Desenvolvimento local
```bash
npm install
npm run dev        # http://localhost:5173
npm run lint       # opcional
npm run build      # build prod + PWA
npm run preview    # servir dist local
```

### Netlify
- Config: `netlify.toml` (build `npm run build`, publish `dist`, SPA redirect `/* -> /index.html 200`)
- Faça deploy conectando o repositório ao Netlify ou via `netlify deploy` apontando publish para `dist/`.

### Armazenamento & offline
- Logs de treino e de exercícios ficam no IndexedDB via Dexie.
- Configurações (data de início, toggle de recuperação) ficam na tabela `settings`.
- Manifesto PWA + service worker gerados no build; app funciona offline após o primeiro carregamento.

### Exportar / Importar / Resetar
- Exportar: Configurações → “Exportar” baixa um JSON com treinos/exercícios/config.
- Importar: Configurações → “Importar” aceita o mesmo JSON; valida com Zod antes de salvar.
- Resetar: Configurações → “Resetar” limpa os logs (mantém configurações).

### Telas
- Dashboard: card “Hoje” (sessão, alerta de deload, atalho rápido), aquecimento, regras, últimos logs, barra de aderência.
- Semana: seletor 1–12, cards Seg/Qua/Sex abrindo sessões, linha do tempo das fases.
- Sessão: aquecimento colapsável, cartões de exercício com prescrição, dica de deload, logging de séries (carga/reps/RIR/feito), notas, adicionar série, finalizar salvando.
- Histórico do exercício: gráfico por exercício (volume/carga), PRs, tabela de sessões.
- Progresso: lista de exercícios com melhor carga + link para detalhes.
- Configurações: toggle de recuperação (+1 série), data de início, exportar/importar/resetar.

### Melhorias futuras
- Autenticação + sync em nuvem entre dispositivos
- Alertas para dias de sessão e deloads
- Modo coach/atleta com feedback
- Anexar mídia (vídeos de execução) aos logs

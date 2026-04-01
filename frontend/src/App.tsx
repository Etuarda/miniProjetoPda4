import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Award, BarChart3, BookOpen, Check, Circle, Clock, FileText, Info,
  LayoutDashboard, Leaf, LogOut, PieChart, Plus, RefreshCw, Settings, Sparkles,
  Target, Trophy, Trash2, X, Save, CheckCircle2
} from 'lucide-react';
import { Button } from './components/Button';
import { SidebarItem } from './components/SidebarItem';
import { useQuestionnaire } from './hooks/useQuestionnaire';
import { useLiveMessage } from './hooks/useLiveMessage';
import { AXIS_LABELS } from './constants/axis';
import { createDiagnosticResult } from './services/diagnostic.service';
import { createRoadmap, getRoadmapById, getRoadmapTasks } from './services/roadmap.service';
import { deleteTask, updateTask } from './services/task.service';
import type { DiagnosticResult, Roadmap, Task } from './types';

// Estados da aplicação: navegação entre telas do fluxo diagnóstico → roadmap
type Step = 'home' | 'quiz' | 'result' | 'roadmap';
// Vistas do dashboard: roadmap, estatísticas, resumos, configurações
type DashboardView = 'roadmap' | 'stats' | 'summaries' | 'settings';

export default function App() {
  // Carrega questões do backend e gerencia estado de loading
  const { questions, isLoading } = useQuestionnaire();
  // Sistema de anúncios para acessibilidade (screen readers)
  const { ariaMessage, announce } = useLiveMessage();

  // Estado atual da aplicação (home → quiz → result → roadmap)
  const [step, setStep] = useState<Step>('home');
  // Vista atual do dashboard quando em modo roadmap
  const [currentDashboardView, setCurrentDashboardView] = useState<DashboardView>('roadmap');
  // Nome do usuário coletado na tela inicial
  const [userName, setUserName] = useState('');
  // Respostas do questionário: questionId → valor (1-5)
  const [answers, setAnswers] = useState<Record<string, number>>({});
  // Resultado do diagnóstico gerado pelo backend
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  // Roadmap gerado baseado no diagnóstico
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  // Lista de tarefas do roadmap atual
  const [tasks, setTasks] = useState<Task[]>([]);
  // Tarefa atualmente selecionada para edição
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  // Notas gerais do usuário sobre o progresso
  const [generalNotes, setGeneralNotes] = useState('');
  // Flag para mostrar formulário de nova tarefa
  const [isAddingTask, setIsAddingTask] = useState(false);
  // Flag para indicar carregamento durante operações assíncronas
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Campos do formulário de nova tarefa
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Cálculos derivados: conta perguntas respondidas para validação
  const answeredQuestionsCount = useMemo(() => Object.keys(answers).length, [answers]);
  // Conta tarefas concluídas para cálculo de progresso
  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  // Porcentagem de conclusão do roadmap
  const completionPercentage = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Carrega notas do localStorage uma vez no início
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedNotes = localStorage.getItem('generalNotes');
    if (savedNotes !== null) {
      setGeneralNotes(savedNotes);
    }
  }, []);

  /**
   * Submete diagnóstico para o backend após validação completa.
   * Regra de negócio: todas as perguntas devem ser respondidas.
   */
  async function handleSubmitDiagnostic() {
    if (answeredQuestionsCount < questions.length) return;
    setIsSubmitting(true);
    try {
      const result = await createDiagnosticResult({
        userName,
        answers: questions.map((question) => ({
          questionId: question.id,
          value: answers[question.id]
        }))
      });
      setDiagnostic(result);
      setStep('result');
      announce('Diagnóstico gerado com sucesso.');
    } catch {
      announce('Não foi possível gerar o diagnóstico.');
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Gera roadmap personalizado baseado no resultado do diagnóstico.
   * Cria roadmap e carrega tarefas associadas automaticamente.
   */
  async function handleGenerateRoadmap() {
    if (!diagnostic) return;
    setIsSubmitting(true);
    try {
      const createdRoadmap = await createRoadmap(diagnostic.id);
      const createdTasks = await getRoadmapTasks(createdRoadmap.id);
      setRoadmap(createdRoadmap);
      setTasks(createdTasks);
      setStep('roadmap');
      announce('Roadmap criado com sucesso.');
    } catch {
      announce('Não foi possível gerar o roadmap.');
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Atualiza dados do roadmap do backend.
   * Mantém sincronização entre estado local e servidor.
   */
  async function refreshRoadmapData() {
    if (!roadmap) return;
    const updatedRoadmap = await getRoadmapById(roadmap.id);
    const updatedTasks = await getRoadmapTasks(roadmap.id);
    setRoadmap(updatedRoadmap);
    setTasks(updatedTasks);
    if (activeTask) {
      const updatedActiveTask = updatedTasks.find((task) => task.id === activeTask.id) ?? null;
      setActiveTask(updatedActiveTask);
    }
  }

  /**
   * Alterna status da tarefa entre pendente e concluída.
   * Tarefas customizadas são atualizadas localmente, outras vão para o backend.
   */
  async function handleToggleTaskStatus(task: Task) {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    if (task.roadmapId !== 'custom-roadmap') {
      await updateTask(task.id, { status: nextStatus });
      await refreshRoadmapData();
    } else {
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));
      if (activeTask?.id === task.id) {
        setActiveTask({ ...task, status: nextStatus });
      }
    }
    announce(`Módulo ${task.title} atualizado.`);
  }

  async function handleUpdateTask(taskId: string, payload: Partial<Task>) {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    if (currentTask.roadmapId !== 'custom-roadmap') {
      const updatedTask = await updateTask(taskId, {
        explanation: payload.explanation,
        experiment: payload.experiment,
        notes: payload.notes
      });
      setTasks((current) => current.map((item) => item.id === taskId ? updatedTask : item));
      if (activeTask?.id === taskId) setActiveTask(updatedTask);
      return;
    }

    const nextTask = { ...currentTask, ...payload };
    setTasks((current) => current.map((item) => item.id === taskId ? nextTask : item));
    if (activeTask?.id === taskId) setActiveTask(nextTask);
  }

  async function handleDeleteTask(task: Task) {
    if (task.roadmapId !== 'custom-roadmap') {
      await deleteTask(task.id);
      await refreshRoadmapData();
    } else {
      setTasks((current) => current.filter((item) => item.id !== task.id));
    }
    setActiveTask(null);
    announce(`Módulo ${task.title} removido.`);
  }

  function handleAddCustomTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      roadmapId: 'custom-roadmap',
      axis: 'custom',
      title: newTaskTitle,
      description: newTaskDescription || 'Módulo adicionado manualmente pelo arquiteto.',
      status: 'pending',
      explanation: '',
      experiment: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: null
    };

    setTasks((current) => [task, ...current]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsAddingTask(false);
    announce(`Módulo ${task.title} adicionado com sucesso.`);
  }

  function handleCopy(value: string) {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      announce('Conteúdo copiado para a área de transferência.');
    });
  }

  function resetAll() {
    setStep('home');
    setCurrentDashboardView('roadmap');
    setUserName('');
    setAnswers({});
    setDiagnostic(null);
    setRoadmap(null);
    setTasks([]);
    setActiveTask(null);
    setGeneralNotes('');
    localStorage.removeItem('generalNotes');
    setIsAddingTask(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
  }

  function renderHome() {
    return (
      <main className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn px-4">
        <div className="w-20 h-20 bg-[#D7CCC8] rounded-[2rem] flex items-center justify-center mb-8 rotate-3 shadow-lg shadow-[#D7CCC8]/20">
          <Leaf className="text-[#5D4037] w-10 h-10" />
        </div>
        <h1 className="text-5xl md:text-7xl font-serif text-[#3E2723] mb-4 text-center">Backend Architect</h1>
        <p className="text-[#5D4037] text-lg mb-12 text-center max-w-lg leading-relaxed font-medium">
          Uma plataforma de auto-análise para estudantes de desenvolvimennto que buscam o próximo nível de excelência em sistemas Node.js.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (userName.trim()) setStep('quiz');
          }}
          className="bg-white p-2 rounded-2xl shadow-2xl border border-[#EFEBE9] flex w-full max-w-md"
        >
          <input
            type="text"
            placeholder="Como devemos lhe chamar?"
            className="flex-1 px-6 py-3 bg-transparent outline-none text-[#5D4037] font-bold placeholder-[#8D6E63]"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
          />
          <Button type="submit" disabled={!userName.trim()}>
            Iniciar <ArrowRight size={18} />
          </Button>
        </form>
      </main>
    );
  }

  function renderQuiz() {
    return (
      <main className="max-w-3xl mx-auto py-10 animate-fadeIn px-4">
        <header className="mb-16 flex justify-between items-end border-b border-[#EFEBE9] pb-8">
          <div>
            <span className="text-[#795548] text-xs font-bold uppercase tracking-widest mb-2 block">Diagnóstico v2.0</span>
            <h2 className="text-4xl font-serif text-[#3E2723]">Nível de Competência</h2>
          </div>
          <div className="text-right">
            <span className="text-3xl font-serif text-[#5D4037]">{answeredQuestionsCount} <span className="text-lg text-[#795548]">/ {questions.length}</span></span>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center py-20 text-[#5D4037] font-medium">Carregando perguntas...</div>
        ) : (
          <>
            <div className="space-y-12">
              {questions.map((question, index) => (
                <fieldset key={question.id} className="relative group border-0 p-0 m-0">
                  <legend className="sr-only">{question.prompt}</legend>
                  <div className="flex items-start gap-4 mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#EFEBE9] flex items-center justify-center text-[#5D4037] font-bold text-xs shrink-0">{index + 1}</span>
                    <div>
                      <p className="text-xl text-[#3E2723] mb-2 font-bold leading-tight">{question.prompt}</p>
                      <div className="flex items-center gap-2 text-[#5D4037] bg-[#EFEBE9] px-4 py-3 rounded-xl text-sm border border-[#D7CCC8]">
                        <Info size={16} className="shrink-0" />
                        <p className="text-sm font-medium leading-normal">{question.guidance[(answers[question.id]?.toString() || '1') as keyof typeof question.guidance]}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 pl-12 mt-4">
                    {[1,2,3,4,5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAnswers((current) => ({ ...current, [question.id]: value }))}
                        className={`flex-1 h-14 rounded-2xl border-2 transition-all font-bold text-lg cursor-pointer ${
                          answers[question.id] === value
                            ? 'bg-[#5D4037] border-[#5D4037] text-white shadow-lg -translate-y-1'
                            : 'border-[#795548] text-[#5D4037] hover:border-[#5D4037] bg-white'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="mt-20 flex justify-center">
              <Button className="w-full md:w-auto md:px-20 h-14 text-lg" onClick={handleSubmitDiagnostic} disabled={answeredQuestionsCount < questions.length || isSubmitting}>
                {isSubmitting ? 'Gerando diagnóstico...' : 'Ver Análise Técnica'}
              </Button>
            </div>
          </>
        )}
      </main>
    );
  }

  function renderResult() {
    if (!diagnostic) return null;

    return (
      <main className="max-w-4xl mx-auto py-10 animate-fadeIn px-4">
        <div className="bg-white rounded-[3rem] p-12 border border-[#EFEBE9] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5F2F0] rounded-full -mr-32 -mt-32 opacity-50" />
          <div className="flex flex-col items-center mb-16 relative z-10">
            <div className="w-20 h-20 bg-[#5D4037] rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-6">
              <Award className="text-white" size={40} />
            </div>
            <h2 className="text-4xl font-serif text-[#3E2723]">Resultado do Arquiteto</h2>
            <p className="text-[#5D4037] font-medium text-center max-w-sm mt-2">Sua distribuição de conhecimento atual conforme os eixos de estudo.</p>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-16 relative z-10">
            {Object.entries(diagnostic.scores).map(([axis, score]) => (
              <div key={axis}>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-bold text-[#5D4037] uppercase tracking-tighter">{AXIS_LABELS[axis]}</span>
                  <span className="text-xl font-serif text-[#3E2723]">{score.toFixed(1)} <span className="text-xs text-[#795548]">/ 5</span></span>
                </div>
                <div className="w-full h-3 bg-[#EFEBE9] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${score <= 2 ? 'bg-[#795548]' : 'bg-[#5D4037]'}`} style={{ width: `${(score / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </section>

          <div className="flex flex-col md:flex-row gap-4 relative z-10">
            <Button variant="secondary" className="flex-1 h-14 rounded-2xl" onClick={() => setStep('quiz')}>Refazer Avaliação</Button>
            <Button className="flex-1 h-14 rounded-2xl shadow-lg" onClick={handleGenerateRoadmap} disabled={isSubmitting}>
              {isSubmitting ? 'Gerando roadmap...' : 'Gerar Dashboard'} <Sparkles size={18} />
            </Button>
          </div>
        </div>
      </main>
    );
  }

  function renderRoadmapList() {
    return (
      <section className="space-y-6">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsAddingTask(true)} variant="secondary" className="bg-white">
            <Plus size={18} /> Novo Módulo Customizado
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.length > 0 ? tasks.map((task) => (
            <article
              key={task.id}
              tabIndex={0}
              onClick={() => setActiveTask(task)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveTask(task);
                }
              }}
              className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group relative overflow-hidden ${
                activeTask?.id === task.id ? 'bg-white border-[#5D4037] shadow-xl translate-x-2' : 'bg-white border-[#EFEBE9] hover:border-[#D7CCC8] hover:shadow-lg shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl transition-all ${activeTask?.id === task.id ? 'bg-[#5D4037] text-white shadow-lg' : 'bg-[#F5F2F0] text-[#5D4037]'}`}>
                  <BookOpen size={24} />
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleToggleTaskStatus(task);
                  }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                    task.status === 'completed' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'border-[#795548] bg-white group-hover:border-[#5D4037]'
                  }`}
                >
                  {task.status === 'completed' && <Check size={20} />}
                </button>
              </div>

              <span className="text-[10px] font-bold text-[#795548] uppercase tracking-[0.2em] mb-2 block">{AXIS_LABELS[task.axis]}</span>
              <h4 className="text-2xl font-serif text-[#3E2723] mb-3 leading-tight">{task.title}</h4>
              <p className="text-[#5D4037] text-sm line-clamp-2 leading-relaxed opacity-90">{task.description}</p>
            </article>
          )) : (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-[#EFEBE9] rounded-[3rem]">
              <Sparkles className="mx-auto mb-4 text-[#795548]" size={48} />
              <p className="text-[#5D4037] font-serif italic text-xl">Nenhum gap identificado. Você está no caminho certo!</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderStats() {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#EFEBE9] shadow-sm flex flex-col items-center text-center">
          <PieChart className="text-[#5D4037] mb-4" size={40} />
          <h4 className="text-3xl font-serif text-[#3E2723]">{completionPercentage}%</h4>
          <p className="text-[#795548] text-sm uppercase tracking-widest font-bold mt-2">Conclusão Total</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#EFEBE9] shadow-sm flex flex-col items-center text-center">
          <Target className="text-[#795548] mb-4" size={40} />
          <h4 className="text-3xl font-serif text-[#3E2723]">{completedTasks}</h4>
          <p className="text-[#795548] text-sm uppercase tracking-widest font-bold mt-2">Módulos Finalizados</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#EFEBE9] shadow-sm flex flex-col items-center text-center">
          <BookOpen className="text-[#8D6E63] mb-4" size={40} />
          <h4 className="text-3xl font-serif text-[#3E2723]">{tasks.length}</h4>
          <p className="text-[#795548] text-sm uppercase tracking-widest font-bold mt-2">Total de Metas</p>
        </div>
      </section>
    );
  }

  function renderSummaries() {
    return (
      <section className="space-y-10 animate-fadeIn">
        <div className="flex flex-col min-h-[300px] bg-white rounded-[2.5rem] border-2 border-[#EFEBE9] shadow-inner overflow-hidden">
          <div className="px-6 py-4 md:px-8 md:py-5 border-b-2 border-[#EFEBE9] bg-[#FAF8F6] flex items-center justify-between">
            <label htmlFor="general-notepad" className="text-[12px] font-bold text-[#5D4037] uppercase tracking-[0.2em] flex items-center gap-2 m-0 cursor-pointer">
              <FileText size={16} /> Anotações Livres
            </label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setGeneralNotes('')} className="p-2 text-[#795548] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-[#FFFCF9] relative notepad-container">
            <textarea
              id="general-notepad"
              placeholder="Espaço livre para rascunhos, esboços de arquitetura, ou links úteis..."
              className="w-full h-full min-h-[250px] bg-transparent border-none outline-none text-[#3E2723] placeholder-[#A1887F] resize-none text-lg font-medium notepad-lines px-6 py-4 md:px-8 md:py-6"
              value={generalNotes}
              onChange={(event) => setGeneralNotes(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-8">
          {tasks.filter((task) => task.notes).length > 0 ? tasks.filter((task) => task.notes).map((task) => (
            <article key={task.id} className="flex flex-col min-h-[200px] bg-white rounded-[2.5rem] border-2 border-[#EFEBE9] shadow-inner overflow-hidden">
              <div className="px-6 py-4 md:px-8 md:py-5 border-b-2 border-[#EFEBE9] bg-[#FAF8F6]">
                <span className="text-[10px] font-bold text-[#795548] uppercase tracking-widest">{AXIS_LABELS[task.axis]}</span>
                <h4 className="text-xl font-serif text-[#3E2723] mt-1">{task.title}</h4>
              </div>
              <div className="flex-1 bg-[#FFFCF9] relative notepad-container">
                <textarea
                  className="w-full h-full min-h-[150px] bg-transparent border-none outline-none text-[#3E2723] placeholder-[#A1887F] resize-y text-lg font-medium notepad-lines px-6 py-4 md:px-8 md:py-6"
                  value={task.notes}
                  onChange={(event) => void handleUpdateTask(task.id, { notes: event.target.value })}
                />
              </div>
            </article>
          )) : null}
        </div>
      </section>
    );
  }

  function renderSettings() {
    return (
      <section className="max-w-md mx-auto py-10 animate-fadeIn text-center">
        <div className="bg-white p-12 rounded-[3rem] border border-[#EFEBE9] shadow-xl">
          <div className="w-20 h-20 bg-rose-50 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw size={40} />
          </div>
          <h3 className="text-2xl font-serif text-[#3E2723] mb-4">Reiniciar Jornada</h3>
          <p className="text-[#5D4037] mb-10 text-sm">Isso apagará todos os seus scores, tarefas e anotações permanentemente.</p>
          <Button variant="danger" className="w-full mb-4" onClick={resetAll}>Confirmar Reset Total</Button>
          <Button variant="secondary" className="w-full" onClick={() => setCurrentDashboardView('roadmap')}>Voltar ao Dashboard</Button>
        </div>
      </section>
    );
  }

  function renderActiveTask() {
    if (!activeTask) return null;

    return (
      <article className="mt-4 bg-white rounded-[3rem] p-8 lg:p-12 border border-[#EFEBE9] shadow-2xl animate-slideUp relative">
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="px-4 py-1.5 bg-[#EFEBE9] text-[#5D4037] rounded-full text-[11px] font-bold uppercase tracking-widest border border-[#D7CCC8]">
                Eixo: {AXIS_LABELS[activeTask.axis]}
              </span>
              <div className="flex items-center gap-1 text-[#795548] text-[11px] font-bold">
                <Clock size={14} /> Adicionado em {new Date(activeTask.createdAt).toLocaleDateString()}
              </div>
            </div>
            <h3 className="text-4xl font-serif text-[#3E2723]">{activeTask.title}</h3>
          </div>

          <button type="button" onClick={() => void handleDeleteTask(activeTask)} className="p-3 bg-[#EFEBE9] hover:bg-rose-50 hover:text-rose-700 text-[#795548] rounded-full transition-all cursor-pointer">
            <Trash2 size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-stretch">
          <div className="lg:col-span-2 space-y-8 flex flex-col">
            <div>
              <h4 className="text-[11px] font-bold text-[#795548] uppercase tracking-[0.2em] mb-4 block">Sugestão de Estudo</h4>
              <p className="text-[#5D4037] text-lg leading-relaxed font-medium italic">"{activeTask.description}"</p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-[#795548] uppercase tracking-[0.2em] mb-3 block">Explicação autoral</h4>
              <textarea
                className="w-full min-h-32 px-5 py-4 rounded-2xl bg-[#FAF8F6] border-2 border-[#EFEBE9] outline-none text-[#3E2723] resize-none"
                value={activeTask.explanation}
                onChange={(event) => void handleUpdateTask(activeTask.id, { explanation: event.target.value })}
                placeholder="Explique o conceito com suas próprias palavras."
              />
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-[#795548] uppercase tracking-[0.2em] mb-3 block">Experimento prático</h4>
              <textarea
                className="w-full min-h-32 px-5 py-4 rounded-2xl bg-[#FAF8F6] border-2 border-[#EFEBE9] outline-none text-[#3E2723] resize-none"
                value={activeTask.experiment}
                onChange={(event) => void handleUpdateTask(activeTask.id, { experiment: event.target.value })}
                placeholder="Cole um link, um snippet ou descreva o experimento."
              />
            </div>

            <div className="mt-auto pt-8">
              <h4 className="text-[11px] font-bold text-[#795548] uppercase tracking-[0.2em] mb-4 block">Status da Meta</h4>
              <button type="button" onClick={() => void handleToggleTaskStatus(activeTask)} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all font-bold cursor-pointer ${activeTask.status === 'completed' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-[#795548] text-[#5D4037] hover:border-[#5D4037]'}`}>
                {activeTask.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                {activeTask.status === 'completed' ? 'Meta Batida' : 'Marcar como Finalizada'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col min-h-[400px] bg-white rounded-[2.5rem] border-2 border-[#EFEBE9] shadow-inner overflow-hidden">
            <div className="px-8 py-5 border-b-2 border-[#EFEBE9] bg-[#FAF8F6] flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#5D4037] uppercase tracking-[0.2em] flex items-center gap-2 m-0 cursor-pointer">
                <FileText size={16} /> Bloco de Notas
              </label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => void handleUpdateTask(activeTask.id, { notes: '' })} className="p-2 text-[#795548] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-[#FFFCF9] relative notepad-container">
              <textarea
                placeholder="Anote aqui suas descobertas, códigos de exemplo ou dúvidas sobre este módulo..."
                className="w-full h-full min-h-[300px] bg-transparent border-none outline-none text-[#3E2723] placeholder-[#A1887F] resize-none text-lg font-medium notepad-lines px-8 py-6"
                value={activeTask.notes}
                onChange={(event) => void handleUpdateTask(activeTask.id, { notes: event.target.value })}
              />
            </div>
            <div className="px-8 py-5 border-t-2 border-[#EFEBE9] bg-[#FAF8F6] flex justify-end">
              <Button variant="primary" onClick={() => setActiveTask(null)}>
                <Save size={18} /> Fechar Caderno
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  function renderRoadmapView() {
    const percentage = roadmap?.progress.completionPercentage ?? completionPercentage;

    return (
      <div className="flex flex-col lg:flex-row min-h-[90vh] gap-10 animate-fadeIn px-4 lg:px-0">
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-[#EFEBE9] shadow-xl sticky top-8 flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-[#F5F2F0] pb-6">
              <div className="w-14 h-14 bg-[#3E2723] rounded-2xl flex items-center justify-center text-[#FAF8F6] font-serif italic text-2xl shadow-lg">
                {userName.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-[#795548] font-bold uppercase tracking-[0.2em]">Candidato</p>
                <p className="font-serif text-xl text-[#3E2723] truncate w-32" title={userName}>{userName}</p>
              </div>
            </div>

            <div className="bg-[#FAF8F6] p-5 rounded-3xl border border-[#EFEBE9]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-[#5D4037] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Trophy size={16} /> Completude do Plano
                </span>
                <span className="text-xl font-serif text-[#3E2723]">{percentage}%</span>
              </div>
              <div className="w-full h-3 bg-[#EFEBE9] rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-[#5D4037] to-[#8D6E63] rounded-full transition-all duration-700 ease-in-out" style={{ width: `${percentage}%` }} />
              </div>
              <p className="text-[11px] text-[#795548] mt-3 font-bold uppercase tracking-widest text-right">Meta: 100%</p>
            </div>

            <nav className="space-y-2">
              <SidebarItem icon={LayoutDashboard} label="Meu Roadmap" active={currentDashboardView === 'roadmap'} onClick={() => { setCurrentDashboardView('roadmap'); setActiveTask(null); }} />
              <SidebarItem icon={BarChart3} label="Progresso Técnico" active={currentDashboardView === 'stats'} onClick={() => setCurrentDashboardView('stats')} />
              <SidebarItem icon={FileText} label="Meus Resumos" active={currentDashboardView === 'summaries'} onClick={() => setCurrentDashboardView('summaries')} />
              <SidebarItem icon={Settings} label="Configurações" active={currentDashboardView === 'settings'} onClick={() => setCurrentDashboardView('settings')} />
            </nav>

            <div className="pt-6 border-t border-[#EFEBE9]">
              <Button variant="ghost" className="w-full justify-start px-4 text-rose-800 hover:text-rose-900" onClick={resetAll}>
                <LogOut size={18} /> Abandonar Sessão
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 pb-20 relative">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h2 className="text-4xl font-serif text-[#3E2723] mb-2">
                {currentDashboardView === 'roadmap' && 'Evolução do Roteiro'}
                {currentDashboardView === 'stats' && 'Análise de Desempenho'}
                {currentDashboardView === 'summaries' && 'Dicionário Técnico'}
                {currentDashboardView === 'settings' && 'Preferências'}
              </h2>
              <p className="text-[#5D4037] font-medium text-sm">Organize seus blocos de aprendizado técnico.</p>
            </div>
          </header>

          {currentDashboardView === 'roadmap' && !activeTask && renderRoadmapList()}
          {currentDashboardView === 'roadmap' && activeTask && renderActiveTask()}
          {currentDashboardView === 'stats' && renderStats()}
          {currentDashboardView === 'summaries' && renderSummaries()}
          {currentDashboardView === 'settings' && renderSettings()}

          {isAddingTask && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#3E2723]/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 border border-[#EFEBE9] shadow-2xl animate-slideUp">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-serif text-[#3E2723]">Novo Módulo</h3>
                  <button type="button" onClick={() => setIsAddingTask(false)} className="p-2 text-[#795548] hover:text-[#5D4037] hover:bg-[#F5F2F0] rounded-full transition-colors cursor-pointer">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddCustomTask} className="space-y-6">
                  <div>
                    <label className="text-[12px] font-bold text-[#5D4037] uppercase tracking-widest mb-3 block">Título do Estudo</label>
                    <input
                      type="text"
                      placeholder="Ex: Introdução ao gRPC"
                      className="w-full px-6 py-4 rounded-2xl bg-[#FAF8F6] border-2 border-[#EFEBE9] outline-none text-[#5D4037] font-medium"
                      value={newTaskTitle}
                      onChange={(event) => setNewTaskTitle(event.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-[#5D4037] uppercase tracking-widest mb-3 block">Descrição / Objetivo</label>
                    <textarea
                      placeholder="O que você pretende aprender neste bloco?"
                      className="w-full px-6 py-4 rounded-2xl bg-[#FAF8F6] border-2 border-[#EFEBE9] outline-none text-[#5D4037] font-medium h-32 resize-none"
                      value={newTaskDescription}
                      onChange={(event) => setNewTaskDescription(event.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full h-14 text-lg">
                    Adicionar ao Roadmap <Plus size={20} />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F6] p-6 lg:p-12 font-sans selection:bg-[#D7CCC8] selection:text-[#3E2723]">
      <div className="max-w-7xl mx-auto">
        {step === 'home' && renderHome()}
        {step === 'quiz' && renderQuiz()}
        {step === 'result' && renderResult()}
        {step === 'roadmap' && renderRoadmapView()}
      </div>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {ariaMessage}
      </div>
    </div>
  );
}

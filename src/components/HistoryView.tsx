import React, { useEffect, useState } from 'react';
import { Mail, ArrowRight, Clock, Search, ExternalLink, ListTodo, Plus, Trash2, Calendar, AlertCircle, CheckCircle, CheckSquare, Square, ThumbsUp } from 'lucide-react';
import { loadAllTasks, toggleTaskStatus, deleteTask, KanbanTask } from '../lib/kanbanService';
import { useT } from '../lib/i18n';
import Markdown from 'react-markdown';

interface HistoryItem {
  id: string;
  timestamp: number;
  subject: string;
  body: string;
  recipientEmail: string;
}

export default function HistoryView() {
  const t = useT();
  const [activeSubTab, setActiveSubTab] = useState<'kanban' | 'drafts'>('kanban');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  
  // Kanban board states
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  // New manual task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'red' | 'yellow' | 'green'>('yellow');
  const [newTaskChannel, setNewTaskChannel] = useState('');
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    // Load email draft history
    const savedDrafts = localStorage.getItem('serene_draft_history');
    if (savedDrafts) {
      try {
        const parsed = JSON.parse(savedDrafts);
        setHistory(parsed.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // Load kanban tasks
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const allTasks = await loadAllTasks();
      setTasks(allTasks);
    } catch (e) {
      console.error("Failed to fetch kanban tasks", e);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleToggleTask = async (task: KanbanTask) => {
    try {
      const updatedStatus = await toggleTaskStatus(task.id, task.status);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: updatedStatus } : t));
    } catch (e) {
      console.error("Failed to toggle task", e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm(t('hv_confirm_delete'))) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error("Failed to delete task", e);
    }
  };

  const handleAddManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAddingTask(true);
    const { saveExtractedTasks } = await import('../lib/kanbanService');
    try {
      const added = await saveExtractedTasks(
        [{ step: newTaskTitle, officialChannel: newTaskChannel, url: newTaskUrl }],
        t('hv_self_task'),
        newTaskDueDate,
        newTaskPriority === 'red' ? 'high' : newTaskPriority === 'yellow' ? 'medium' : 'low'
      );
      setTasks(prev => [...added, ...prev]);
      
      // Reset form
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setNewTaskPriority('yellow');
      setNewTaskChannel('');
      setNewTaskUrl('');
    } catch (e) {
      console.error("Failed to add manual task", e);
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleAddToGoogleCalendar = (task: KanbanTask) => {
    const formattedDate = task.dueDate.replace(/-/g, '');
    const title = `${t('hv_cal_title_prefix')}${task.title}`;
    const details = t('hv_cal_details')
      .replace('{channel}', task.channel || t('hv_unspecified'))
      .replace('{url}', task.url || t('hv_no_link'))
      .replace('{source}', task.sourceLetter);
    
    // Create UTC URL or full day template
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDate}/${formattedDate}&details=${encodeURIComponent(details)}&sf=true&output=xml`;
    window.open(calendarUrl, '_blank');
  };

  const handleAddAllToGoogleCalendar = () => {
    const pendingTasks = tasks.filter(t => t.status === 'todo');
    if (pendingTasks.length === 0) {
      alert(t('hv_no_sync'));
      return;
    }
    
    // Advise user we will open bookmarks
    alert(t('hv_open_cal_notice').replace('{n}', String(pendingTasks.length)));
    
    pendingTasks.forEach(task => {
      handleAddToGoogleCalendar(task);
    });
  };

  const handleSendDraft = (item: HistoryItem) => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(item.recipientEmail)}&su=${encodeURIComponent(item.subject)}&body=${encodeURIComponent(item.body)}`;
    window.open(url, '_blank');
  };

  // Stats Counters
  const countTodo = tasks.filter(t => t.status === 'todo').length;
  const countDone = tasks.filter(t => t.status === 'done').length;
  const countUrgent = tasks.filter(t => t.status === 'todo' && t.priority === 'red').length;

  if (selectedItem) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100">
        <button 
          onClick={() => setSelectedItem(null)}
          className="mb-6 text-sm font-bold text-gray-400 hover:text-[#1d1d1f] transition flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowRight className="rotate-180" size={16} /> {t('hv_back')}
        </button>
        <div>
          <h2 className="text-2xl font-bold mb-2 text-[#1d1d1f]">{selectedItem.subject}</h2>
          <p className="text-sm text-gray-400 mb-8 flex items-center gap-2 font-medium">
            <Clock size={14} /> {new Date(selectedItem.timestamp).toLocaleString()}
          </p>

          <div className="mb-6 bg-gray-50 rounded-2xl p-4 text-xs text-gray-600 font-mono border border-gray-100">
            <span className="font-bold mr-2 text-gray-400">{t('hv_sendto')}</span> {selectedItem.recipientEmail || t('hv_unspecified')}
          </div>

          <div className="bg-white border text-gray-800 border-gray-100 rounded-3xl p-6 text-sm resize-none min-h-[300px] shadow-sm leading-relaxed overflow-y-auto markdown-body">
            <Markdown>{selectedItem.body}</Markdown>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => handleSendDraft(selectedItem)}
              className="bg-[#1d1d1f] hover:bg-[#1a1a1a] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer text-xs"
            >
              <span>{t('hv_go_gmail')}</span>
              <ExternalLink size={14} className="opacity-70" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-11px font-black text-[#ff5a3c] tracking-widest uppercase mb-1.5">Dashboard & Action Desk</h2>
          <h1 className="text-4xl font-extrabold text-[#1d1d1f] tracking-tight leading-none">{t('hv_hero')}</h1>
          <p className="text-gray-400 text-xs mt-2 font-medium">{t('hv_sub')}</p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/50 self-start md:self-end">
          <button 
            onClick={() => setActiveSubTab('kanban')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${activeSubTab === 'kanban' ? 'bg-[#1d1d1f] text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <ListTodo size={14} />
            <span>{t('hv_tab_desk')} ({tasks.length})</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('drafts')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${activeSubTab === 'drafts' ? 'bg-[#1d1d1f] text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Mail size={14} />
            <span>{t('hv_tab_history')} ({history.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'kanban' ? (
        <div className="animate-in fade-in duration-300">
          {/* Action Desk Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#FAF6EE] border border-amber-200/40 rounded-3xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ff5a3c]/10 text-[#ff5a3c] flex items-center justify-center font-bold">
                <Calendar size={22} />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 tracking-wider">{t('hv_inprogress')}</span>
                <h3 className="text-2xl font-black text-[#1d1d1f]">{countTodo} <span className="text-xs font-normal text-gray-500">{t('hv_unit')}</span></h3>
              </div>
            </div>

            <div className="bg-red-50/50 border border-red-100 rounded-3xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <AlertCircle size={22} />
              </div>
              <div>
                <span className="text-[10px] font-black text-red-400 tracking-wider">{t('hv_redline')}</span>
                <h3 className="text-2xl font-black text-red-800">{countUrgent} <span className="text-xs font-normal text-red-500">{t('hv_unit')}</span></h3>
              </div>
            </div>

            <div className="bg-surface-soft/40 border border-hairline rounded-3xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-soft text-ink flex items-center justify-center font-bold">
                <CheckCircle size={22} />
              </div>
              <div>
                <span className="text-[10px] font-black text-ink tracking-wider">{t('hv_done')}</span>
                <h3 className="text-2xl font-black text-ink">{countDone} <span className="text-xs font-normal text-[#1d1d1f]">{t('hv_unit')}</span></h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Box: Manual task insertion / add memo */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm h-fit">
              <form onSubmit={handleAddManualTask} className="flex flex-col gap-4">
                <h2 className="text-xs font-black tracking-widest text-gray-400 uppercase flex items-center gap-1.5 mb-2">
                  <Plus size={14} /> {t('hv_form_title')}
                </h2>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('hv_todo_desc')}</label>
                  <input 
                    type="text" 
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder={t('hv_todo_ph')}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 ring-gray-200 transition-all font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase font-sans">{t('hv_deadline')}</label>
                  <input 
                    type="date" 
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 ring-gray-200 transition-all font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('hv_severity')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'red', label: t('hv_red'), bg: 'bg-red-50 text-red-800 hover:bg-red-100', activeBg: 'bg-red-650 text-white border-red-650' },
                      { code: 'yellow', label: t('hv_yellow'), bg: 'bg-amber-50 text-amber-800 hover:bg-amber-100', activeBg: 'bg-[#ff5a3c] text-white border-[#ff5a3c]' },
                      { code: 'green', label: t('hv_green'), bg: 'bg-surface-soft text-ink hover:bg-surface-soft', activeBg: 'bg-ink text-white border-hairline' }
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.code}
                        onClick={() => setNewTaskPriority(opt.code as any)}
                        className={`py-2 px-1.5 rounded-xl border text-[10px] font-black tracking-tight text-center transition-all cursor-pointer ${newTaskPriority === opt.code ? opt.activeBg : `${opt.bg} border-transparent`}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('hv_channel')}</label>
                  <input 
                    type="text" 
                    value={newTaskChannel}
                    onChange={(e) => setNewTaskChannel(e.target.value)}
                    placeholder={t('hv_channel_ph')}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 ring-gray-200 transition-all font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('hv_link')}</label>
                  <input 
                    type="url" 
                    value={newTaskUrl}
                    onChange={(e) => setNewTaskUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 ring-gray-200 transition-all font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingTask || !newTaskTitle}
                  className="mt-2 w-full bg-[#1d1d1f] hover:bg-neutral-800 text-white disabled:opacity-50 text-xs font-black py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{isAddingTask ? t('hv_adding') : t('hv_save')}</span>
                </button>
              </form>
            </div>

            {/* Right Box: The Kanban Checklist board */}
            <div className="lg:col-span-8 flex flex-col justify-between bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm min-h-[480px]">
              <div>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-2 text-xs font-black text-gray-400 tracking-wider uppercase">
                  <span>{t('hv_actionlist')}</span>
                  <button 
                    onClick={handleAddAllToGoogleCalendar}
                    className="bg-[#FAF6EE] text-[#ff5a3c] border border-amber-200/50 hover:bg-[#FAF1E1] px-4 py-2 rounded-xl text-[10px] cursor-pointer font-black flex items-center gap-1 transition-all"
                  >
                    <Calendar size={12} />
                    <span>{t('hv_sync_cal')}</span>
                  </button>
                </div>

                {isLoadingTasks ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="w-8 h-8 border-3 border-[#1d1d1f] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-xs font-bold">{t('hv_loading')}</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-[#FAF6EE] text-[#ff5a3c] rounded-full flex items-center justify-center mb-4">
                      <ListTodo size={28} />
                    </div>
                    <h3 className="text-base font-bold text-gray-700 mb-1.5">{t('hv_empty_todo')}</h3>
                    <p className="text-xs text-gray-400 max-w-sm leading-relaxed px-4">
                      {t('hv_empty_todo_sub')}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-1">
                    {tasks.map(task => {
                      const priorityStyles = 
                        task.priority === 'red' 
                          ? 'border-l-4 border-l-red-500 bg-red-50/20' 
                          : task.priority === 'yellow' 
                            ? 'border-l-4 border-l-amber-400 bg-amber-50/10' 
                            : 'border-l-4 border-l-ink bg-surface-soft/10';

                      return (
                        <div 
                          key={task.id}
                          className={`group/task flex items-start gap-4 p-4 rounded-2xl border border-gray-100 transition-all hover:border-gray-200 hover:shadow-sm ${priorityStyles} ${task.status === 'done' ? 'opacity-60' : ''}`}
                        >
                          <button 
                            onClick={() => handleToggleTask(task)}
                            className="text-[#1d1d1f] hover:scale-110 active:scale-95 transition-all w-5 h-5 shrink-0 mt-0.5 cursor-pointer"
                          >
                            {task.status === 'done' ? (
                              <CheckSquare size={19} className="text-[#1d1d1f]" />
                            ) : (
                              <Square size={19} className="text-gray-300 hover:text-gray-400" />
                            )}
                          </button>

                          <div className="flex-1 flex flex-col gap-1.5">
                            <p className={`text-xs font-black leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {task.title}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2 text-[10px]">
                              {/* Due date and Google calendar link */}
                              <div className="flex items-center gap-1.5 text-gray-450 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md font-sans">
                                <Clock size={11} className="text-gray-400" />
                                <span className={task.priority === 'red' && task.status === 'todo' ? 'text-red-700 font-bold' : ''}>
                                  {t('hv_due_prefix')} {task.dueDate}
                                </span>
                                {task.status === 'todo' && (
                                  <button 
                                    onClick={() => handleAddToGoogleCalendar(task)}
                                    title={t('hv_add_to_cal')}
                                    className="text-[#ff5a3c] hover:text-[#ff5a3c] hover:underline font-extrabold flex items-center gap-0.5 cursor-pointer bg-white px-1.5 py-0.5 rounded border border-amber-100"
                                  >
                                    <span>{t('hv_gcal')}</span>
                                  </button>
                                )}
                              </div>

                              {/* Source Attribution */}
                              <span className="text-gray-400 font-bold bg-[#FAF6EE] text-amber-800 px-1.5 py-0.5 rounded-md leading-normal line-clamp-1 max-w-[200px]">
                                {t('hv_source_prefix')} {task.sourceLetter.substring(0, 25)}{task.sourceLetter.length > 25 && '...'}
                              </span>

                              {/* Channel and Link */}
                              {task.channel && (
                                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-bold leading-normal">
                                  {t('hv_channel_prefix')} {task.channel}
                                </span>
                              )}

                              {task.url && (
                                <a 
                                  href={task.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#1d1d1f] hover:text-[#ff5a3c] hover:underline font-bold inline-flex items-center gap-0.5"
                                >
                                  <span>{t('hv_portal')}</span>
                                </a>
                              )}
                            </div>
                          </div>

                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-300 hover:text-red-500 hover:scale-105 active:scale-95 transition-all p-1 rounded-lg hover:bg-red-50 ml-auto cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Original Email Draft History Panel */
        <div className="animate-in fade-in duration-300">
          {history.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">{t('hv_empty_history')}</h3>
              <p className="text-gray-400 text-sm max-w-xs">{t('hv_empty_history_sub')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm cursor-pointer hover:border-[#1d1d1f]/30 hover:shadow-md transition-all group relative overflow-hidden flex items-start justify-between"
                >
                  <div className="flex-1 pr-6 flex flex-col gap-2">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#1d1d1f] transition-colors">{item.subject}</h3>
                    <p className="text-sm text-gray-400 font-mono line-clamp-2 md:line-clamp-1 leading-relaxed">{item.body.substring(0, 150)}...</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1"><Clock size={12}/> {new Date(item.timestamp).toLocaleDateString()}</span>
                      <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1"><Mail size={12}/> {item.recipientEmail || t('hv_no_email')}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-[#f5f5f7] rounded-full flex items-center justify-center group-hover:bg-[#1d1d1f] group-hover:text-white text-gray-400 transition-colors">
                    <ArrowRight size={18} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

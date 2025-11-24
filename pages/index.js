import { useState } from 'react';

const EMPLOYEES = [
  { id: 'AP', name: 'Alexis Preciado' },
  { id: 'TL', name: 'Tanner Langenbahn' },
  { id: 'CG', name: 'Cris Gonzalez' }
];

const PROJECTS = [
  { id: '1208', address: '1208 W 71st Terrace, Kansas City, MO' },
  { id: '2217', address: '2217 S Cedar Ave, Independence, MO' },
  { id: 'other', address: 'Other (enter below)' }
];

const TASKS = [
  'Demo',
  'Framing',
  'Drywall - Hang',
  'Drywall - Sand',
  'Drywall - Texture',
  'Paint - Prep and caulking',
  'Paint - Primer',
  'Paint - Interior',
  'Paint - Exterior',
  'Tile - Concrete board',
  'Tile - Shower',
  'Tile - Floor',
  'Tile - Grout',
  'Cabinets - Lowers',
  'Cabinets - Uppers',
  'Trim - Base shoe',
  'Trim - Baseboard',
  'Trim - Crown',
  'Trim - Window casing',
  'Trim - Door casing',
  'Trim - Interior doors',
  'Trim - Exterior doors',
  'Window replacement',
  'Flooring',
  'Electrical',
  'Cleanup',
  'Lunch',
  'Other'
];

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyOGL16xo_ARbb8Rk7H75DBNTX9IHEF55x85T_l6fSeEKJTNpvH_yD0exRQ8Z-138Y7yA/exec';

export default function DailyHoursForm() {
  const [employee, setEmployee] = useState('');
  const [project, setProject] = useState('');
  const [customProject, setCustomProject] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [totalHoursFraction, setTotalHoursFraction] = useState('0');
  const [tasks, setTasks] = useState([{ task: '', hours: '', hoursFraction: '0', notes: '' }]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  const taskHoursSum = tasks.reduce((sum, t) => {
    const whole = parseFloat(t.hours) || 0;
    const fraction = parseFloat(t.hoursFraction) || 0;
    return sum + whole + fraction;
  }, 0);
  const totalHoursValue = (parseFloat(totalHours) || 0) + (parseFloat(totalHoursFraction) || 0);
  const hoursMatch = totalHoursValue === taskHoursSum;
  const formValid = employee && (project !== 'other' ? project : customProject) && totalHoursValue > 0 && taskHoursSum > 0 && hoursMatch;

  const addTask = () => setTasks([...tasks, { task: '', hours: '', hoursFraction: '0', notes: '' }]);
  const removeTask = (index) => tasks.length > 1 && setTasks(tasks.filter((_, i) => i !== index));
  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleSubmit = async () => {
    if (!formValid || submitting) return;
    
    setSubmitting(true);
    setError('');

    const payload = {
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US'),
      employee: EMPLOYEES.find(e => e.id === employee)?.name || employee,
      employeeId: employee,
      project: project === 'other' ? customProject : PROJECTS.find(p => p.id === project)?.address,
      totalHours: totalHoursValue,
      tasks: tasks.filter(t => t.task && (parseFloat(t.hours) || parseFloat(t.hoursFraction))).map(t => ({
        task: t.task,
        hours: (parseFloat(t.hours) || 0) + (parseFloat(t.hoursFraction) || 0),
        notes: t.notes
      }))
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center border border-slate-700">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Hours Submitted!</h2>
          <p className="text-slate-400 mb-6">Thanks for logging your time today.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setEmployee('');
              setProject('');
              setCustomProject('');
              setTotalHours('');
              setTotalHoursFraction('0');
              setTasks([{ task: '', hours: '', hoursFraction: '0', notes: '' }]);
              setError('');
            }}
            className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
          >
            Submit Another Day
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-6 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Daily Hours</h1>
          <p className="text-emerald-400 font-medium">{today}</p>
        </div>

        <div className="mb-6">
          <label className="block text-slate-400 text-sm font-medium mb-2">WHO ARE YOU?</label>
          <div className="grid grid-cols-1 gap-3">
            {EMPLOYEES.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setEmployee(emp.id)}
                className={`p-4 rounded-xl text-left font-semibold transition-all ${
                  employee === emp.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {emp.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-slate-400 text-sm font-medium mb-2">WHICH JOB?</label>
          <div className="grid grid-cols-1 gap-3">
            {PROJECTS.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setProject(proj.id)}
                className={`p-4 rounded-xl text-left font-semibold transition-all ${
                  project === proj.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {proj.address}
              </button>
            ))}
          </div>
          
          {project === 'other' && (
            <input
              type="text"
              value={customProject}
              onChange={(e) => setCustomProject(e.target.value)}
              placeholder="Paste address here..."
              className="mt-3 w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          )}
        </div>

        <div className="mb-6">
          <label className="block text-slate-400 text-sm font-medium mb-2">TOTAL HOURS TODAY</label>
          <div className="flex gap-3">
            <input
              type="number"
              step="1"
              min="0"
              max="24"
              value={totalHours}
              onChange={(e) => setTotalHours(e.target.value)}
              placeholder="8"
              className="flex-1 p-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-2xl font-bold text-center placeholder-slate-500 focus:outline-none focus:border-emera

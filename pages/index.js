import { useState } from 'react';

const EMPLOYEES = [
  { id: 'AP', name: 'Alexis Preciado' },
  { id: 'TL', name: 'Tanner Langenbahn' },
  { id: 'CG', name: 'Cris Gonzalez' },
  { id: 'JC', name: 'Jeff Crawford' },
  { id: 'TEST', name: 'Test Entry' }
];

const PROJECTS = [
  { id: '1208', address: '1208 W 71st Terrace, Kansas City, MO' },
  { id: '2217', address: '2217 S Cedar Ave, Independence, MO' },
  { id: '6206', address: '6206 Robinson St, Overland Park, KS' },
  { id: 'test', address: 'TEST - Do Not Use for Payroll' },
  { id: 'other', address: 'Other (enter below)' }
];

const TASKS = [
  'Demo',
  'Concrete - Demo',
  'Concrete - Finish',
  'Framing',
  'Insulation',
  'Drywall - Hang',
  'Drywall - Sand',
  'Drywall - Texture',
  'Paint - Prep',
  'Paint - Prep and caulking',
  'Paint - Primer',
  'Paint - Interior',
  'Paint - Exterior',
  'Paint - Doors',
  'Paint - Floor trim',
  'Paint - Window trim',
  'Tile - Concrete board',
  'Tile - Shower',
  'Tile - Floor',
  'Tile - Grout',
  'Cabinets - Lowers',
  'Cabinets - Uppers',
  'Cabinet hardware',
  'Countertops',
  'Trim - Base shoe',
  'Trim - Baseboard',
  'Trim - Crown',
  'Trim - Window casing',
  'Trim - Door casing',
  'Trim - Interior doors',
  'Trim - Exterior doors',
  'Door hardware',
  'Window replacement',
  'Flooring',
  'Electrical - Rough',
  'Electrical - Finish',
  'Plumbing - Rough',
  'Plumbing - Finish',
  'Ductwork - Rough',
  'Ductwork - Finish',
  'Roofing',
  'Site work',
  'Cleanup',
  'Other'
];

const ADMIN_TASKS = [
  'Bidding / Estimating',
  'Customer meetings',
  'Customer calls',
  'Material runs',
  'Invoicing',
  'Scheduling',
  'Travel'
];

const ROOMS = [
  'Kitchen',
  'Living Room',
  'Dining Room',
  'Master Bedroom',
  'Master Bedroom - Closet',
  'Bedroom 1',
  'Bedroom 1 - Closet',
  'Bedroom 2',
  'Bedroom 2 - Closet',
  'Bedroom 3',
  'Bedroom 3 - Closet',
  'Bedroom 4',
  'Bedroom 4 - Closet',
  'Bathroom 1',
  'Bathroom 2',
  'Bathroom 3',
  'Laundry Room',
  'Garage',
  'Basement',
  'Exterior - Front',
  'Exterior - Left Side',
  'Exterior - Right Side',
  'Exterior - Back',
  'Whole House',
  'Other'
];

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxeT7KraqY8maXILohdfQCX2eNU_aedb3qVjzDnu7bEG-tkoDqD7Og-Sgybu4Sj-7gYTA/exec';

export default function DailyHoursForm() {
  const [employee, setEmployee] = useState('');
  const [project, setProject] = useState('');
  const [customProject, setCustomProject] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [totalHoursFraction, setTotalHoursFraction] = useState('0');
  const [tasks, setTasks] = useState([{ room: '', task: '', hours: '', hoursFraction: '0', notes: '' }]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  // Show admin tasks only for Jeff
  const isAdmin = employee === 'JC';
  const availableTasks = isAdmin ? [...TASKS, ...ADMIN_TASKS] : TASKS;

  const taskHoursSum = tasks.reduce((sum, t) => {
    const whole = parseFloat(t.hours) || 0;
    const fraction = parseFloat(t.hoursFraction) || 0;
    return sum + whole + fraction;
  }, 0);
  const totalHoursValue = (parseFloat(totalHours) || 0) + (parseFloat(totalHoursFraction) || 0);
  const hoursMatch = totalHoursValue === taskHoursSum;
  const formValid = employee && (project !== 'other' ? project : customProject) && totalHoursValue > 0 && taskHoursSum > 0 && hoursMatch;

  const addTask = () => setTasks([...tasks, { room: '', task: '', hours: '', hoursFraction: '0', notes: '' }]);
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
        room: t.room || 'Not specified',
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
              setTasks([{ room: '', task: '', hours: '', hoursFraction: '0', notes: '' }]);
              setError('');
            }}
            className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
          >
            Submit Another Entry
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
              className="flex-1 p-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-2xl font-bold text-center placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={totalHoursFraction}
              onChange={(e) => setTotalHoursFraction(e.target.value)}
              className="w-24 p-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-2xl font-bold text-center focus:outline-none focus:border-emerald-500"
            >
              <option value="0">.00</option>
              <option value="0.25">.25</option>
              <option value="0.5">.50</option>
              <option value="0.75">.75</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-slate-400 text-sm font-medium">TASK BREAKDOWN</label>
            {totalHoursValue > 0 && (
              <span className={`text-sm font-semibold ${hoursMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                {taskHoursSum} / {totalHoursValue} hrs
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={index} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="mb-3">
                  <label className="block text-slate-400 text-xs font-medium mb-2">ROOM</label>
                  <select
                    value={task.room}
                    onChange={(e) => updateTask(index, 'room', e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select room...</option>
                    {ROOMS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 mb-3">
                  <select
                    value={task.task}
                    onChange={(e) => updateTask(index, 'task', e.target.value)}
                    className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select task...</option>
                    {availableTasks.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={task.hours}
                    onChange={(e) => updateTask(index, 'hours', e.target.value)}
                    placeholder="Hrs"
                    className="w-16 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-emerald-500"
                  />
                  
                  <select
                    value={task.hoursFraction}
                    onChange={(e) => updateTask(index, 'hoursFraction', e.target.value)}
                    className="w-20 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-emerald-500"
                  >
                    <option value="0">.00</option>
                    <option value="0.25">.25</option>
                    <option value="0.5">.50</option>
                    <option value="0.75">.75</option>
                  </select>
                  
                  {tasks.length > 1 && (
                    <button
                      onClick={() => removeTask(index)}
                      className="p-3 bg-slate-700 hover:bg-red-900 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <input
                  type="text"
                  value={task.notes}
                  onChange={(e) => updateTask(index, 'notes', e.target.value)}
                  placeholder="What did you work on? Any details?"
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={addTask}
            className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-xl border border-slate-700 border-dashed transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Task
          </button>
        </div>

        {totalHoursValue > 0 && !hoursMatch && (
          <div className="mb-6 p-4 bg-amber-900/30 border border-amber-500/30 rounded-xl">
            <p className="text-amber-400 text-sm font-medium">
              Task hours ({taskHoursSum}) don't match total hours ({totalHoursValue}). 
              {taskHoursSum < totalHoursValue 
                ? ` Add ${(totalHoursValue - taskHoursSum).toFixed(2)} more hours.`
                : ` Remove ${(taskHoursSum - totalHoursValue).toFixed(2)} hours.`
              }
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!formValid || submitting}
          className={`w-full py-5 rounded-xl font-bold text-lg transition-all ${
            formValid && !submitting
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Hours'}
        </button>

        <p className="text-center text-slate-600 text-sm mt-6">
          Questions? Text Jeff
        </p>
      </div>
    </div>
  );
}

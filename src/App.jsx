import React, { useState, useEffect } from 'react';
import { 
  Settings, BookOpen, CheckCircle, XCircle, Award, 
  ChevronRight, Plus, Trash2, Edit, Save, User, 
  PlayCircle, FileText, Printer, ArrowLeft, Lock, ExternalLink,
  Link as LinkIcon, Download, Building, X, Users, UserCheck, UserX, Mail, Key, CreditCard, BarChart,
  MessageCircle, Clock, AlertTriangle, Upload
} from 'lucide-react';

// --- IMPORTACIONES DE FIREBASE ---
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const defaultLevels = [
  {
    id: 'lvl-1',
    title: 'Nivel 1: Cultura Corporativa',
    content: 'Bienvenido a nuestra empresa. Nuestra misión es brindar soluciones innovadoras que mejoren la vida de las personas. Nuestros valores centrales son: \n\n1. Integridad\n2. Trabajo en equipo\n3. Excelencia\n4. Innovación\n\nPor favor, lee atentamente estos valores, ya que son el pilar de nuestro trabajo diario.',
    materials: [
      { id: 'm1', title: 'Video de Bienvenida', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'video' }
    ],
    questions: [
      {
        id: 'q1',
        text: '¿Cuál de los siguientes NO es uno de nuestros valores centrales?',
        options: ['Integridad', 'Trabajo en equipo', 'Individualismo', 'Innovación'],
        correctOptionIndex: 2
      },
      {
        id: 'q2',
        text: 'Nuestra misión principal está enfocada en:',
        options: ['Generar ingresos rápidamente', 'Brindar soluciones innovadoras', 'Vender productos básicos', 'Expandirnos a otros países sin planificación'],
        correctOptionIndex: 1
      }
    ]
  },
  {
    id: 'lvl-2',
    title: 'Nivel 2: Seguridad de la Información',
    content: 'La seguridad de los datos de nuestros clientes es fundamental. \n\nReglas básicas:\n- Nunca compartas tus contraseñas.\n- Bloquea tu equipo cuando te alejes de tu escritorio.\n- No abras correos de remitentes desconocidos.\n- Usa contraseñas alfanuméricas complejas.',
    materials: [],
    questions: [
      {
        id: 'q3',
        text: '¿Qué debes hacer cuando te alejas de tu escritorio?',
        options: ['Dejar la pantalla encendida', 'Bloquear el equipo', 'Apagar el monitor solamente', 'Pedir a un compañero que vigile'],
        correctOptionIndex: 1
      }
    ]
  }
];

const defaultCompanies = [
  {
    id: 'santa',
    name: 'Santa Priscila',
    settings: { maxScore: 100, passingScore: 70 },
    levels: JSON.parse(JSON.stringify(defaultLevels)),
    users: [{ id: 'u1', name: 'Colaborador Demo', cedula: '0999999999', phone: '0999999999', email: 'demo@empresa.com', password: '123' }],
    pendingRequests: []
  },
  {
    id: 'nirsa',
    name: 'Nirsa',
    settings: { maxScore: 20, passingScore: 14 },
    levels: JSON.parse(JSON.stringify(defaultLevels)),
    users: [],
    pendingRequests: []
  },
  {
    id: 'zhumir',
    name: 'Zhumir',
    settings: { maxScore: 10, passingScore: 7 },
    levels: [],
    users: [],
    pendingRequests: []
  }
];

export default function App() {
  const [role, setRole] = useState('admin'); // 'admin' | 'learner'
  const [adminAuth, setAdminAuth] = useState(false); // Estado de sesión del Admin
  const [companies, setCompanies] = useState([]);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [globalProgress, setGlobalProgress] = useState({});
  const [loadingDb, setLoadingDb] = useState(true);

  const showDialog = (options) => setDialog(options);
  const closeDialog = () => setDialog(null);

  // --- CONEXIÓN EN TIEMPO REAL CON FIREBASE ---
  useEffect(() => {
    const unsubCompanies = onSnapshot(collection(db, 'companies'), (snapshot) => {
      if (snapshot.empty) {
        // Si la base de datos está vacía, subimos las empresas de prueba automáticamente
        defaultCompanies.forEach(async (comp) => {
          await setDoc(doc(db, 'companies', comp.id), comp);
        });
      } else {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompanies(loaded);
      }
      setLoadingDb(false);
    });

    const unsubProgress = onSnapshot(collection(db, 'progress'), (snapshot) => {
       const prog = {};
       snapshot.docs.forEach(doc => { prog[doc.id] = doc.data(); });
       setGlobalProgress(prog);
    });

    return () => { unsubCompanies(); unsubProgress(); };
  }, []);

  // Escuchar y aplicar el hash (link directo)
  useEffect(() => {
    try {
      const hash = window.location.hash.replace('#', '');
      if (hash && companies.length > 0) {
        const found = companies.find(c => c.id === hash);
        if (found) {
          setCurrentCompanyId(hash);
          setRole('learner'); 
        }
      }
    } catch (e) {
      console.warn("Entorno bloquea lectura de hash", e);
    }
  }, [companies]);

  // Actualizar el hash en la URL para compartir
  useEffect(() => {
    try {
      if (role === 'learner' && currentCompanyId) {
        window.history.replaceState(null, '', `#${currentCompanyId}`);
      } else if (role === 'admin' || !currentCompanyId) {
        window.history.replaceState(null, '', window.location.pathname || '/');
      }
    } catch (e) {
      console.warn("Entorno bloquea replaceState", e);
    }
  }, [currentCompanyId, role]);

  const currentCompany = companies.find(c => c.id === currentCompanyId);

  // --- FUNCIONES PARA GUARDAR EN FIREBASE ---
  const handleUpdateCompany = async (updatedCompany) => {
    try { await setDoc(doc(db, 'companies', updatedCompany.id), updatedCompany); } 
    catch (error) { console.error("Error guardando empresa:", error); }
  };

  const handleDeleteCompany = async (companyId) => {
    try { await deleteDoc(doc(db, 'companies', companyId)); } 
    catch (error) { console.error("Error eliminando empresa:", error); }
  };

  const handleUpdateProgress = async (progKey, newProgressData) => {
    try { await setDoc(doc(db, 'progress', progKey), newProgressData); } 
    catch (error) { console.error("Error guardando progreso:", error); }
  };

  // PANTALLA DE CARGA
  if (loadingDb) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-500 animate-pulse">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
          <p className="text-xl font-bold">Conectando a la Base de Datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative">
      <header className="bg-indigo-600 text-white p-4 shadow-md print:hidden sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentCompanyId(null)}>
            <BookOpen className="w-6 h-6" />
            <h1 className="text-xl font-bold hidden sm:block">CapacitaCorp e-Learning</h1>
            <h1 className="text-xl font-bold sm:hidden">CapacitaCorp</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 bg-indigo-700 p-1 rounded-lg">
            <button 
              onClick={() => { setRole('learner'); setCurrentCompanyId(null); }}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${role === 'learner' ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:text-white'}`}
            >
              Colaborador
            </button>
            <button 
              onClick={() => { setRole('admin'); setCurrentCompanyId(null); }}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${role === 'admin' ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:text-white'}`}
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 pb-20">
        {role === 'admin' ? (
          !adminAuth ? (
            <AdminLogin onLogin={() => setAdminAuth(true)} />
          ) : !currentCompanyId ? (
            <AdminPortalSelector 
              companies={companies} 
              onUpdateCompany={handleUpdateCompany} 
              onDeleteCompany={handleDeleteCompany} 
              onSelectCompany={setCurrentCompanyId} 
              showDialog={showDialog} 
              onLogout={() => setAdminAuth(false)} 
            />
          ) : (
            <AdminDashboard 
              company={currentCompany} 
              onUpdateCompany={handleUpdateCompany} 
              onBack={() => setCurrentCompanyId(null)} 
              companies={companies} 
              showDialog={showDialog} 
              globalProgress={globalProgress} 
            />
          )
        ) : (
          !currentCompanyId ? (
            <LearnerGateway companies={companies} onEnterCode={setCurrentCompanyId} />
          ) : (
            <LearnerDashboard 
              company={currentCompany} 
              onUpdateCompany={handleUpdateCompany} 
              globalProgress={globalProgress} 
              onUpdateProgress={handleUpdateProgress} 
              onBack={() => setCurrentCompanyId(null)} 
            />
          )
        )}
      </main>

      <DialogModal dialog={dialog} closeDialog={closeDialog} />
    </div>
  );
}

function DialogModal({ dialog, closeDialog }) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (dialog && dialog.type === 'prompt') setInputValue('');
  }, [dialog]);

  if (!dialog) return null;

  const handleConfirm = () => {
    if (dialog.type === 'prompt') {
      dialog.onConfirm(inputValue);
    } else if (dialog.onConfirm) {
      dialog.onConfirm();
    }
    closeDialog();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">{dialog.title}</h3>
          <button onClick={closeDialog} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6">
          <p className="text-slate-600 mb-4 whitespace-pre-line">{dialog.message}</p>
          
          {dialog.type === 'prompt' && (
            <input 
              type="text" 
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={dialog.placeholder}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
              onKeyDown={(e) => { if(e.key === 'Enter') handleConfirm(); }}
            />
          )}

          <div className="flex justify-end space-x-3 mt-6">
            {dialog.type !== 'alert' && (
              <button onClick={closeDialog} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
            )}
            <button onClick={handleConfirm} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    // Validar con las credenciales del Super Administrador
    if (email === 'miguelgurumendi92@gmail.com' && password === 'Lmg54321') {
      onLogin();
    } else {
      setError('Credenciales incorrectas o no autorizadas.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center animate-in fade-in zoom-in">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Key className="w-10 h-10 text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Administración</h2>
      <p className="text-slate-500 mb-6 text-sm">Ingresa tus credenciales de super administrador para gestionar los portales.</p>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="email" name="email" required placeholder="Correo Electrónico" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-left" />
        <input type="password" name="password" required placeholder="Contraseña" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-left" />
        {error && <p className="text-red-500 text-sm text-left font-medium bg-red-50 p-2 rounded">{error}</p>}
        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">Ingresar al Panel</button>
      </form>
    </div>
  );
}

function AdminPortalSelector({ companies, onUpdateCompany, onDeleteCompany, onSelectCompany, showDialog, onLogout }) {
  const handleAddCompany = () => {
    showDialog({
      type: 'prompt',
      title: 'Nueva Empresa',
      message: 'Ingresa el nombre de la nueva empresa o ambiente de capacitación:',
      placeholder: 'Ej: Empresa S.A.',
      onConfirm: (name) => {
        if (name.trim()) {
          // Generar enlace corto
          let words = name.trim().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\b(s\.?a\.?|c\.?a\.?|cia|ltda|corp|de|del|la|el|los|las|y)\b/g, '') 
            .replace(/[^a-z0-9\s]+/g, '')
            .split(/\s+/).filter(w => w.length > 0);
          
          let baseSlug = 'emp';
          if (words.length === 1) {
            baseSlug = words[0].substring(0, 6);
          } else if (words.length > 1) {
            baseSlug = words.map(w => w[0]).join('').substring(0, 4);
          }
          
          let finalSlug = baseSlug;
          let counter = 1;
          while (companies.find(c => c.id === finalSlug)) {
            finalSlug = `${baseSlug}${counter}`; 
            counter++;
          }

          onUpdateCompany({ id: finalSlug, name: name.trim(), settings: { maxScore: 100, passingScore: 70 }, levels: [], users: [], pendingRequests: [] });
        }
      }
    });
  };

  const copyLink = (id, e) => {
    e.stopPropagation();
    let link = "";
    try {
      const origin = window.location.origin === 'null' ? 'https://plataforma-elearning.com' : window.location.origin;
      const pathname = window.location.pathname === 'about:srcdoc' ? '/' : window.location.pathname;
      link = `${origin}${pathname}#${id}`;
    } catch (err) {
      link = `https://plataforma-elearning.com/#${id}`;
    }
    showDialog({
      type: 'alert',
      title: 'Enlace Corto Generado',
      message: `Este es el link directo para los colaboradores:\n\n🔗 ${link}\n\nCódigo de acceso manual: "${id}"`
    });
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Ambientes de Capacitación</h2>
          <p className="text-slate-500 mt-1">Gestiona los portales e-learning de cada empresa.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button onClick={handleAddCompany} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 shadow-sm">
            <Plus className="w-5 h-5" /> <span>Crear Empresa</span>
          </button>
          <button onClick={onLogout} className="text-sm font-medium text-slate-600 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 px-4 py-2.5 rounded-lg transition-colors">
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => (
          <div key={company.id} onClick={() => onSelectCompany(company.id)} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition cursor-pointer group flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{company.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {company.id}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button onClick={(e) => copyLink(company.id, e)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition" title="Obtener enlace">
                  <LinkIcon className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteCompany(company.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition opacity-0 group-hover:opacity-100" title="Eliminar">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-5 bg-slate-50 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-500">Usuarios Registrados</span>
                <span className="font-semibold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">{(company.users || []).length}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-indigo-600 font-medium text-sm mt-auto group-hover:translate-x-1 transition-transform">
                <span>Configurar Portal</span> <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard({ company, onUpdateCompany, onBack, companies, showDialog, globalProgress }) {
  const [editingLevel, setEditingLevel] = useState(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateCompany({ ...company, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewLevel = () => {
    const newLevel = { id: `lvl-${Date.now()}`, title: 'Nuevo Nivel', content: '', materials: [], questions: [] };
    onUpdateCompany({ ...company, levels: [...company.levels, newLevel] });
    setEditingLevel(newLevel);
  };

  const deleteLevel = (id) => {
    showDialog({
      type: 'confirm',
      title: 'Eliminar Nivel',
      message: '¿Seguro que deseas eliminar este nivel y todo su contenido?',
      onConfirm: () => onUpdateCompany({ ...company, levels: company.levels.filter(l => l.id !== id) })
    });
  };

  const saveLevel = (updatedLevel) => {
    onUpdateCompany({ ...company, levels: company.levels.map(l => l.id === updatedLevel.id ? updatedLevel : l) });
    setEditingLevel(null);
  };

  const approveRequest = (req) => {
    const newUser = { id: `u-${Date.now()}`, name: req.name, cedula: req.cedula, phone: req.phone, email: req.email, password: req.password };
    onUpdateCompany({
      ...company,
      users: [...(company.users || []), newUser],
      pendingRequests: (company.pendingRequests || []).filter(r => r.id !== req.id)
    });
  };

  const rejectRequest = (id) => {
    onUpdateCompany({
      ...company,
      pendingRequests: (company.pendingRequests || []).filter(r => r.id !== id)
    });
  };

  const importBank = () => {
    const otherCompanies = companies.filter(c => c.id !== company.id && c.levels.length > 0);
    if (otherCompanies.length === 0) {
      showDialog({ type: 'alert', title: 'Sin bancos', message: 'No hay otras empresas con material para importar.' });
      return;
    }
    let companyListText = otherCompanies.map((c, i) => `${i + 1}. ${c.name} (${c.levels.length} niveles)`).join('\n');
    showDialog({
      type: 'prompt',
      title: 'Importar Banco de Preguntas',
      message: `Escribe el NÚMERO de la empresa:\n\n${companyListText}`,
      placeholder: 'Ej: 1',
      onConfirm: (val) => {
        const index = parseInt(val) - 1;
        if (!isNaN(index) && otherCompanies[index]) {
          const sourceCompany = otherCompanies[index];
          const copiedLevels = JSON.parse(JSON.stringify(sourceCompany.levels)).map(lvl => ({ ...lvl, id: `lvl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }));
          onUpdateCompany({ ...company, levels: [...company.levels, ...copiedLevels] });
        }
      }
    });
  };

  const handleDownloadReport = () => {
    let csvContent = '\uFEFF'; 
    const baseHeaders = ['Colaborador', 'Cédula', 'Correo Electrónico', 'Niveles Aprobados'];
    const levelHeaders = company.levels.map((l, i) => `Nivel ${i+1}: ${l.title}`);
    csvContent += [...baseHeaders, ...levelHeaders].join(';') + '\n';

    if (!company.users || company.users.length === 0) {
      showDialog({ type: 'alert', title: 'Sin datos', message: 'No hay colaboradores para exportar.' });
      return;
    }

    company.users.forEach(user => {
      const userProg = globalProgress ? (globalProgress[`${company.id}_${user.id}`] || {}) : {};
      let passedCount = 0;
      const levelData = company.levels.map(lvl => {
        const status = userProg[lvl.id];
        if (status) {
          if (status.passed) passedCount++;
          return `${status.score} (${status.passed ? 'Aprobado' : 'Reprobado'})`;
        }
        return 'Pendiente';
      });

      const row = [user.name, user.cedula, user.email, `${passedCount} de ${company.levels.length}`, ...levelData];
      csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_${company.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (editingLevel) return <LevelEditor level={editingLevel} onSave={saveLevel} onCancel={() => setEditingLevel(null)} />;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={onBack} className="p-2 bg-white rounded-md border border-slate-200 hover:bg-slate-50 text-slate-500"><ArrowLeft className="w-5 h-5" /></button>
        <div className="relative group">
          <label className="cursor-pointer block relative" title="Subir o cambiar Logo de la Empresa">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Logo" className="w-14 h-14 object-contain bg-white rounded-lg border border-slate-200 p-1 shadow-sm" />
            ) : (
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                <Building className="w-8 h-8" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>
        <h2 className="text-3xl font-bold text-slate-800">{company.name} <span className="text-lg font-normal text-slate-500 ml-2 hidden sm:inline">Panel Admin</span></h2>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-orange-500" /> Solicitudes de Acceso Pendientes ({(company.pendingRequests || []).length})
        </h3>
        {(!company.pendingRequests || company.pendingRequests.length === 0) ? (
          <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200 text-center">No hay solicitudes de acceso pendientes por revisar.</p>
        ) : (
          <div className="space-y-3">
            {company.pendingRequests.map(req => (
              <div key={req.id} className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <p className="font-bold text-slate-800 flex items-center"><User className="w-4 h-4 mr-1 text-slate-400"/>{req.name}</p>
                  <p className="text-sm text-slate-500 mt-1">C.I: {req.cedula} | Tel: {req.phone}</p>
                  <p className="text-sm text-slate-500">{req.email}</p>
                </div>
                <div className="flex space-x-2 mt-3 sm:mt-0">
                  <button onClick={() => approveRequest(req)} className="flex items-center px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-bold transition">
                    <UserCheck className="w-4 h-4 mr-1"/> Permitir
                  </button>
                  <button onClick={() => rejectRequest(req.id)} className="flex items-center px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-bold transition">
                    <UserX className="w-4 h-4 mr-1"/> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b pb-2 gap-3">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <BarChart className="w-5 h-5 text-slate-400" /> <span>Colaboradores</span>
            </h3>
            <button onClick={handleDownloadReport} className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition text-sm font-medium">
              <Download className="w-4 h-4" /> <span>Descargar CSV</span>
            </button>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto">
            {(!company.users || company.users.length === 0) ? (
              <p className="text-center text-slate-500 py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">No hay colaboradores activos.</p>
            ) : (
              company.users.map(user => {
                const userProg = globalProgress ? (globalProgress[`${company.id}_${user.id}`] || {}) : {};
                let passedCount = 0;
                let nextPendingLevel = null;
                
                company.levels.forEach(lvl => { 
                  if (userProg[lvl.id]?.passed) passedCount++; 
                  else if (!nextPendingLevel) nextPendingLevel = lvl;
                });

                const handleSendWA = () => {
                  if (!user.phone) { showDialog({type:'alert', title:'Error', message:'El usuario no tiene número registrado.'}); return; }
                  if (!nextPendingLevel) { showDialog({type:'alert', title:'Aprobado', message:'El usuario ya aprobó todo.'}); return; }
                  const msg = `Hola ${user.name},\nTe recordamos que tienes módulos pendientes en el portal de ${company.name}. El módulo "${nextPendingLevel.title}" vence el ${nextPendingLevel.deadline || 'pronto'}. Pasada esa fecha se bloqueará tu acceso. Por favor, completa tu evaluación.`;
                  
                  let phone = user.phone.replace(/[^0-9]/g, '');
                  // Autocompletar código de país de Ecuador si no lo tiene
                  if (phone.startsWith('09') && phone.length === 10) {
                      phone = '593' + phone.substring(1);
                  }

                  const a = document.createElement('a');
                  a.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                  a.target = '_blank';
                  a.click();
                };

                const handleSendEmail = () => {
                  if (!nextPendingLevel) { showDialog({type:'alert', title:'Aprobado', message:'El usuario ya aprobó todo.'}); return; }
                  const msg = `Hola ${user.name},\n\nTe recordamos que tienes módulos pendientes en el portal de ${company.name}. El módulo "${nextPendingLevel.title}" debe ser aprobado como máximo el ${nextPendingLevel.deadline || 'pronto'}. Pasada esta fecha, la plataforma se bloqueará automáticamente.\n\nPor favor, ingresa a la plataforma para continuar con tu capacitación.\n\nSaludos.`;
                  
                  const a = document.createElement('a');
                  a.href = `mailto:${user.email}?subject=${encodeURIComponent('Recordatorio de Capacitación - ' + company.name)}&body=${encodeURIComponent(msg)}`;
                  a.click();
                };

                return (
                  <div key={user.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition">
                    <div className="flex justify-between mb-3 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-800">{user.name}</h4>
                        <div className="text-xs text-slate-500 mt-1">{user.email} | {user.phone || 'Sin tel'}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right mr-2">
                          <p className="text-xs text-slate-400 font-semibold">Progreso</p>
                          <p className="font-bold text-indigo-700">{passedCount}/{company.levels.length}</p>
                        </div>
                        <button onClick={handleSendWA} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded" title="Notificar por WhatsApp"><MessageCircle className="w-4 h-4" /></button>
                        <button onClick={handleSendEmail} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Notificar por Correo"><Mail className="w-4 h-4" /></button>
                        <button onClick={() => {
                          showDialog({ type: 'confirm', title: 'Revocar Acceso', message: '¿Eliminar acceso a este usuario?', onConfirm: () => onUpdateCompany({ ...company, users: company.users.filter(u => u.id !== user.id) }) });
                        }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Eliminar Acceso"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {company.levels.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {company.levels.map((lvl, i) => {
                          const lvlStatus = userProg[lvl.id];
                          return (
                            <div key={lvl.id} className="text-xs p-1.5 rounded bg-white border border-slate-200 flex justify-between shadow-sm">
                              <span className="truncate mr-1">N{i+1}</span>
                              {lvlStatus ? <span className={`font-bold ${lvlStatus.passed ? 'text-green-600' : 'text-red-600'}`}>{lvlStatus.score} {lvlStatus.passed ? '✅' : '❌'}</span> : <span className="text-slate-400">Pendiente</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-xl font-semibold">Ruta de Aprendizaje</h3>
            <div className="flex space-x-2">
               <button onClick={importBank} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 text-sm font-medium">Importar Banco</button>
               <button onClick={addNewLevel} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 text-sm flex items-center space-x-1"><Plus className="w-4 h-4"/> <span>Añadir</span></button>
            </div>
          </div>
          <div className="space-y-3">
            {company.levels.length === 0 ? (
              <p className="text-center text-slate-500 py-10 bg-slate-50 border-dashed border">No hay niveles.</p>
            ) : (
              company.levels.map((lvl, index) => (
                <div key={lvl.id} className="flex justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{index + 1}</div>
                    <div><h4 className="font-semibold">{lvl.title}</h4><p className="text-xs text-slate-500">{lvl.questions?.length || 0} Preguntas</p></div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setEditingLevel(lvl)} className="p-2 text-blue-600 bg-blue-50 rounded-md"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => deleteLevel(lvl.id)} className="p-2 text-red-600 bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LevelEditor({ level, onSave, onCancel }) {
  const [editedLevel, setEditedLevel] = useState({ ...level, materials: level.materials || [], questions: level.questions || [] });

  const addMaterial = () => setEditedLevel({ ...editedLevel, materials: [...editedLevel.materials, { id: `mat-${Date.now()}`, title: '', url: '', type: 'pdf' }] });
  const updateMaterial = (idx, f, v) => { const u = [...editedLevel.materials]; u[idx][f] = v; setEditedLevel({...editedLevel, materials: u}); };
  const removeMaterial = (idx) => setEditedLevel({...editedLevel, materials: editedLevel.materials.filter((_, i) => i !== idx)});

  const addQuestion = () => setEditedLevel({ ...editedLevel, questions: [...editedLevel.questions, { id: `q-${Date.now()}`, text: '', options: ['', '', '', ''], correctOptionIndex: 0 }] });
  const updateQuestion = (idx, f, v, oIdx = null) => {
    const u = [...editedLevel.questions]; 
    if (f === 'text') u[idx].text = v;
    else if (f === 'option') u[idx].options[oIdx] = v;
    else if (f === 'correctOptionIndex') u[idx].correctOptionIndex = Number(v);
    setEditedLevel({...editedLevel, questions: u});
  };
  const removeQuestion = (idx) => setEditedLevel({...editedLevel, questions: editedLevel.questions.filter((_, i) => i !== idx)});

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex justify-between mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold">Editando Nivel</h2>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="px-4 py-2 border rounded-lg">Cancelar</button>
          <button onClick={() => onSave(editedLevel)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center space-x-2"><Save className="w-4 h-4"/> <span>Guardar</span></button>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input type="text" value={editedLevel.title} onChange={e => setEditedLevel({...editedLevel, title: e.target.value})} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center"><Clock className="w-4 h-4 mr-1 text-indigo-500"/> Fecha Límite (Opcional)</label>
          <input type="date" value={editedLevel.deadline || ''} onChange={e => setEditedLevel({...editedLevel, deadline: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-700" title="Si el usuario no aprueba antes o durante esta fecha, el nivel se bloqueará." />
          <p className="text-xs text-slate-500 mt-1">Si configuras una fecha, el módulo se bloqueará al día siguiente si el alumno no ha aprobado.</p>
        </div>

        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
            <h3 className="font-semibold text-slate-800">Material de Estudio (PDFs, Videos, Links)</h3>
            <button onClick={addMaterial} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-200 font-medium flex items-center"><Plus className="w-3 h-3 mr-1"/> Añadir</button>
          </div>
          <div className="space-y-3">
            {editedLevel.materials.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-2">No has añadido material adicional.</p>
            ) : (
              editedLevel.materials.map((mat, idx) => (
                <div key={mat.id} className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <button onClick={() => removeMaterial(idx)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-md"><Trash2 className="w-4 h-4"/></button>
                  <select value={mat.type} onChange={e => updateMaterial(idx, 'type', e.target.value)} className="p-2 border border-slate-300 rounded-md text-sm w-full sm:w-32 bg-slate-50 focus:ring-2 focus:ring-indigo-500">
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="link">Enlace web</option>
                  </select>
                  <input type="text" value={mat.title} onChange={e => updateMaterial(idx, 'title', e.target.value)} placeholder="Título del material..." className="p-2 border border-slate-300 rounded-md text-sm w-full sm:w-1/3 focus:ring-2 focus:ring-indigo-500" />
                  
                  {mat.type === 'pdf' ? (
                    <div className="flex flex-col sm:flex-row flex-1 gap-2">
                      <input type="text" value={mat.url} onChange={e => updateMaterial(idx, 'url', e.target.value)} placeholder="URL del PDF (O súbelo a la derecha)" className="p-2 border border-slate-300 rounded-md text-sm flex-1 focus:ring-2 focus:ring-indigo-500" />
                      <label className="cursor-pointer bg-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center hover:bg-slate-300 transition">
                        <Upload className="w-4 h-4 mr-2"/> Subir Archivo PDF
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                          const file = e.target.files[0];
                          if(file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const u = [...editedLevel.materials];
                              u[idx].url = reader.result;
                              if(!u[idx].title) u[idx].title = file.name;
                              setEditedLevel({...editedLevel, materials: u});
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>
                  ) : (
                    <input type="text" value={mat.url} onChange={e => updateMaterial(idx, 'url', e.target.value)} placeholder="https://..." className="p-2 border border-slate-300 rounded-md text-sm flex-1 focus:ring-2 focus:ring-indigo-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-lg border">
          <div className="flex justify-between mb-4 border-b pb-2">
            <h3 className="font-semibold">Preguntas de Evaluación</h3>
            <button onClick={addQuestion} className="text-sm border bg-white px-3 py-1 rounded-md text-indigo-600">+ Pregunta</button>
          </div>
          <div className="space-y-4">
            {editedLevel.questions.map((q, qIdx) => (
              <div key={q.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative">
                <button onClick={() => removeQuestion(qIdx)} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
                <label className="block text-sm font-bold text-slate-800 mb-2">Pregunta {qIdx + 1}</label>
                <input type="text" value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} className="w-full p-2 border border-slate-300 rounded mb-4 focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="Escribe aquí la pregunta..." />
                
                <p className="text-xs text-slate-500 mb-3 font-bold uppercase tracking-wider text-center bg-slate-100 py-1 rounded">Selecciona en el círculo la respuesta correcta</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className={`flex items-center space-x-2 p-2 border rounded-lg transition-colors ${q.correctOptionIndex === optIdx ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                      <input type="radio" name={`q-${q.id}`} checked={q.correctOptionIndex === optIdx} onChange={() => updateQuestion(qIdx, 'correctOptionIndex', optIdx)} className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer" title="Marcar como respuesta correcta"/>
                      <input type="text" value={opt} onChange={e => updateQuestion(qIdx, 'option', e.target.value, optIdx)} className="w-full p-1.5 border-none bg-transparent text-sm focus:ring-0 font-medium" placeholder={`Opción ${optIdx+1}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LearnerGateway({ companies, onEnterCode }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    let processedCode = code.trim().toLowerCase();
    if (processedCode.includes('#')) processedCode = processedCode.split('#').pop();
    else if (processedCode.includes('http')) processedCode = processedCode.split('/').pop();

    const found = companies.find(c => c.id === processedCode);
    if (found) onEnterCode(found.id);
    else setError('Código incorrecto. Verifica el enlace enviado por tu empresa.');
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center animate-in fade-in zoom-in">
      <Lock className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Portal de Capacitación</h2>
      <p className="text-slate-500 mb-6 text-sm">Necesitas el <strong>enlace directo</strong> o ingresar el código corto.</p>
      <form onSubmit={handleSubmit}>
        <input type="text" value={code} onChange={e => { setCode(e.target.value); setError(''); }} placeholder="Código o Enlace" className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 text-center" />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold">Ingresar</button>
      </form>
    </div>
  );
}

function LearnerDashboard({ company, onUpdateCompany, globalProgress, onUpdateProgress, onBack }) {
  const [loggedUser, setLoggedUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); 
  const [activeLevel, setActiveLevel] = useState(null);
  const [authError, setAuthError] = useState('');

  const userProgressKey = loggedUser ? `${company.id}_${loggedUser.id}` : '';
  const userProgress = loggedUser ? (globalProgress[userProgressKey] || {}) : {};

  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value, password = e.target.password.value;
    const foundUser = (company.users || []).find(u => u.email === email && u.password === password);
    if (foundUser) { setLoggedUser(foundUser); setAuthError(''); }
    else if ((company.pendingRequests || []).find(r => r.email === email && r.password === password)) setAuthMode('pending');
    else setAuthError('Credenciales incorrectas o usuario no registrado.');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const name = e.target.name.value, cedula = e.target.cedula.value, phone = e.target.phone.value, email = e.target.email.value, password = e.target.password.value;
    if ((company.users || []).find(u => u.email === email) || (company.pendingRequests || []).find(r => r.email === email)) {
      setAuthError('El correo ya está registrado.'); return;
    }
    onUpdateCompany({ ...company, pendingRequests: [...(company.pendingRequests || []), { id: `req-${Date.now()}`, name, cedula, phone, email, password }] });
    setAuthMode('pending'); setAuthError('');
  };

  if (!loggedUser) {
    if (authMode === 'pending') return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border text-center animate-in fade-in">
        <User className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Solicitud en Revisión</h2>
        <p className="text-slate-600 mb-6">Tu solicitud ha sido enviada. Espera a que el administrador apruebe tu acceso.</p>
        <button onClick={() => setAuthMode('login')} className="text-indigo-600 font-medium">Volver</button>
      </div>
    );
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border text-center animate-in fade-in">
        <Building className="w-14 h-14 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-1">Portal {company.name}</h2>
        {authError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-left">{authError}</div>}
        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" name="email" required placeholder="Correo" className="w-full p-3 border rounded-lg text-left" />
            <input type="password" name="password" required placeholder="Contraseña" className="w-full p-3 border rounded-lg text-left" />
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg">Ingresar</button>
            <p className="text-sm mt-4">¿No tienes cuenta? <button type="button" onClick={() => {setAuthMode('register'); setAuthError('');}} className="text-indigo-600 font-bold">Solicitar acceso</button></p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" name="name" required placeholder="Nombres completos" className="w-full p-3 border rounded-lg text-left" />
            <input type="text" name="cedula" required placeholder="Cédula" className="w-full p-3 border rounded-lg text-left" />
            <input type="tel" name="phone" required placeholder="Teléfono (WhatsApp)" className="w-full p-3 border rounded-lg text-left" />
            <input type="email" name="email" required placeholder="Correo" className="w-full p-3 border rounded-lg text-left" />
            <input type="password" name="password" required placeholder="Contraseña" className="w-full p-3 border rounded-lg text-left" />
            <button type="submit" className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg">Enviar Solicitud</button>
            <p className="text-sm mt-4">¿Ya tienes cuenta? <button type="button" onClick={() => {setAuthMode('login'); setAuthError('');}} className="text-indigo-600 font-bold">Ingresar</button></p>
          </form>
        )}
        <button onClick={onBack} className="mt-6 text-sm text-slate-400">Cambiar de portal</button>
      </div>
    );
  }

  if (activeLevel) return <LevelPlayer level={activeLevel} settings={company.settings} userName={loggedUser.name} companyName={company.name} companyLogo={company.logoUrl} progress={userProgress[activeLevel.id]} onBack={() => setActiveLevel(null)} onFinishQuiz={(score, passed) => onUpdateProgress(userProgressKey, { ...userProgress, [activeLevel.id]: { score, passed, completedAt: new Date().toISOString() } })} />;

  return (
    <div className="space-y-6 animate-in fade-in print:hidden">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
         <div className="flex items-center space-x-3"><Building className="w-6 h-6 text-indigo-600"/><div><h2 className="font-bold">{company.name}</h2><p className="text-xs text-slate-500">Hola, {loggedUser.name}</p></div></div>
         <button onClick={() => setLoggedUser(null)} className="text-sm text-slate-500 hover:text-indigo-600 font-medium">Cerrar sesión</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {company.levels.map((lvl, index) => {
          const status = userProgress[lvl.id];
          const isLockedByPrev = index > 0 && !userProgress[company.levels[index - 1].id]?.passed;
          
          const todayStr = new Date().toISOString().split('T')[0];
          const isExpired = lvl.deadline && !status?.passed && todayStr > lvl.deadline;
          const isLocked = isLockedByPrev || isExpired;

          return (
            <div key={lvl.id} className={`bg-white rounded-xl border relative flex flex-col shadow-sm ${isLocked ? 'border-slate-200 opacity-80' : ''}`}>
              {isLockedByPrev && <div className="absolute inset-0 bg-slate-50/90 z-10 flex flex-col items-center justify-center rounded-xl"><Lock className="w-6 h-6 text-slate-400 mb-2" /><span className="text-sm font-medium text-slate-500">Nivel Bloqueado</span><span className="text-xs text-slate-400 mt-1">Aprueba el anterior</span></div>}
              {isExpired && !isLockedByPrev && <div className="absolute inset-0 bg-red-50/95 z-10 flex flex-col items-center justify-center rounded-xl border border-red-200 backdrop-blur-[1px]"><AlertTriangle className="w-8 h-8 text-red-500 mb-2" /><span className="text-sm font-bold text-red-600">Módulo Expirado</span><span className="text-xs text-slate-500 mt-1 px-4 text-center">La fecha límite para aprobar fue el {lvl.deadline}. Contacta a RRHH.</span></div>}
              
              <div className={`p-4 border-b ${status?.passed ? 'bg-green-50' : status ? 'bg-red-50' : 'bg-slate-50'}`}>
                <h3 className="font-bold pr-6">{lvl.title}</h3>
                {lvl.deadline && !status?.passed && <p className={`text-xs font-semibold mt-2 flex items-center ${isExpired ? 'text-red-500' : 'text-orange-600'}`}><Clock className="w-3 h-3 mr-1"/> Límite: {lvl.deadline}</p>}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  {status ? <p className="font-bold text-lg">{status.score}/{company.settings.maxScore} {status.passed ? '✅' : '❌'}</p> : <p className="text-sm text-slate-500">Mínimo: {company.settings.passingScore}</p>}
                </div>
                <button onClick={() => setActiveLevel(lvl)} disabled={isLocked} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold">Comenzar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LevelPlayer({ level, settings, userName, companyName, companyLogo, onBack, progress, onFinishQuiz }) {
  const [view, setView] = useState('material');
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  const submitQuiz = () => {
    let correct = 0;
    level.questions.forEach((q, i) => { if (answers[i] === q.correctOptionIndex) correct++; });
    const score = Math.round(correct * (level.questions.length > 0 ? (settings.maxScore / level.questions.length) : 0));
    setCurrentScore(score); setQuizSubmitted(true);
    onFinishQuiz(score, score >= settings.passingScore);
  };

  // Gestor inteligente para abrir/descargar el material evadiendo bloqueos de seguridad del navegador
  const handleOpenMaterial = (e, mat) => {
    if (mat.url && mat.url.startsWith('data:')) {
      e.preventDefault(); // Evitamos que el navegador intente abrir el base64 en pestaña nueva
      try {
        fetch(mat.url)
          .then(res => res.blob())
          .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = mat.title ? `${mat.title.replace(/[^a-z0-9]/gi, '_')}.pdf` : 'Material_de_Estudio.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          });
      } catch (err) {
        console.error("Error descargando el archivo", err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 print:hidden"><button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-medium bg-white px-3 py-2 rounded-lg border text-sm"><ArrowLeft className="w-4 h-4" /> <span>Volver</span></button></div>
      {view === 'material' && (
        <div className="bg-white p-8 rounded-xl shadow border animate-in slide-in-from-right-8 print:hidden">
          <h2 className="text-3xl font-bold mb-6">{level.title}</h2>
          <div className="prose max-w-none mb-10 whitespace-pre-wrap">{level.content}</div>
          {level.materials?.length > 0 && (
            <div className="mb-10 p-5 bg-indigo-50 rounded-xl">
              <h3 className="font-bold text-indigo-900 mb-4">Material Extra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {level.materials.map(mat => (
                  <a 
                    key={mat.id} 
                    href={mat.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={(e) => handleOpenMaterial(e, mat)}
                    className="flex items-center p-3 bg-white rounded border hover:border-indigo-400 hover:shadow-sm transition cursor-pointer"
                  >
                    {mat.type === 'pdf' ? <FileText className="w-6 h-6 text-red-500 mr-3 flex-shrink-0"/> : 
                     mat.type === 'video' ? <PlayCircle className="w-6 h-6 text-orange-500 mr-3 flex-shrink-0"/> : 
                     <ExternalLink className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0"/>}
                    <div className="overflow-hidden">
                      <span className="font-bold text-slate-800 text-sm truncate block">{mat.title || 'Ver material'}</span>
                      <span className="text-xs text-slate-500">{mat.url.startsWith('data:') ? 'Clic para descargar PDF' : 'Clic para abrir enlace'}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end pt-6 border-t gap-3">
             {progress?.passed && <button onClick={() => setView('certificate')} className="px-6 py-3 bg-green-50 text-green-700 font-bold rounded-lg border">Ver Certificado</button>}
             <button onClick={() => { setAnswers({}); setQuizSubmitted(false); setView('quiz'); }} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg">{progress?.passed ? 'Rehacer Prueba' : 'Tomar Prueba'}</button>
          </div>
        </div>
      )}
      {view === 'quiz' && !quizSubmitted && (
        <div className="bg-white p-8 rounded-xl shadow border animate-in slide-in-from-right-8 print:hidden">
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold mb-2">Evaluación: {level.title}</h2>
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-indigo-800 text-sm">
              <p className="font-medium mb-1">
                Esta evaluación se califica sobre <strong>{settings.maxScore} puntos</strong>.
              </p>
              <p>
                {level.questions.length > 0 && `Consta de ${level.questions.length} preguntas en total. Cada respuesta correcta suma ${(settings.maxScore / level.questions.length).toFixed(2).replace(/\.00$/, '')} puntos.`}
              </p>
              <p className="mt-1 font-bold">Puntaje mínimo requerido para aprobar: {settings.passingScore} puntos.</p>
            </div>
          </div>
          <div className="space-y-6 mb-8">
            {level.questions.map((q, qIndex) => (
              <div key={q.id} className="bg-slate-50 p-5 rounded-xl border">
                <h3 className="font-semibold mb-4">{qIndex + 1}. {q.text}</h3>
                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => (
                    <label key={optIndex} className={`flex items-center p-3 border rounded-lg cursor-pointer ${answers[qIndex] === optIndex ? 'bg-indigo-50 border-indigo-500' : 'bg-white'}`}>
                      <input type="radio" checked={answers[qIndex] === optIndex} onChange={() => setAnswers({...answers, [qIndex]: optIndex})} className="w-4 h-4"/>
                      <span className="ml-3">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {level.questions.length > 0 && <div className="flex justify-end border-t pt-6"><button onClick={submitQuiz} disabled={Object.keys(answers).length < level.questions.length} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50">Enviar</button></div>}
        </div>
      )}
      {view === 'quiz' && quizSubmitted && (
        <div className="bg-white p-10 rounded-xl shadow text-center border print:hidden">
          <h2 className="text-3xl font-bold mb-4">{currentScore >= settings.passingScore ? '¡Aprobado!' : 'No alcanzaste el mínimo.'}</h2>
          <div className="text-6xl font-black mb-6">{currentScore} <span className="text-2xl text-slate-400">/ {settings.maxScore}</span></div>
          <div className="flex justify-center gap-3">
            <button onClick={() => setView('material')} className="px-6 py-3 border rounded-lg font-bold">Material</button>
            {currentScore >= settings.passingScore ? <button onClick={() => setView('certificate')} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg">Certificado</button> : <button onClick={() => { setAnswers({}); setQuizSubmitted(false); }} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg">Reintentar</button>}
          </div>
        </div>
      )}
      {view === 'certificate' && (
        <div>
          <div className="mb-4 flex justify-between print:hidden">
            <button onClick={() => setView('material')} className="text-indigo-600 font-medium">← Volver</button>
            <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-md">Imprimir</button>
          </div>
          <Certificate userName={userName} companyName={companyName} companyLogo={companyLogo} levelTitle={level.title} score={progress?.score || currentScore} maxScore={settings.maxScore} date={progress?.completedAt || new Date().toISOString()} />
        </div>
      )}
    </div>
  );
}

function Certificate({ userName, companyName, companyLogo, levelTitle, score, maxScore, date }) {
  return (
    <div className="bg-white p-12 border-8 border-double border-slate-200 shadow-2xl relative text-center">
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50 rounded-br-full"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-50 rounded-tl-full"></div>
      <div className="relative z-10">
        
        {companyLogo ? (
          <img src={companyLogo} alt={companyName} className="h-16 max-w-xs object-contain mx-auto mb-2 drop-shadow-sm" />
        ) : (
          <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        )}
        
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{companyName}</p>
        <h1 className="text-5xl font-serif font-bold text-slate-800 mt-6 mb-2 uppercase tracking-widest">Certificado</h1>
        <h2 className="text-2xl text-slate-500 uppercase tracking-widest mb-10">de Aprobación</h2>
        <p className="text-slate-600 mb-3 italic">El presente documento certifica que</p>
        <p className="text-4xl font-bold text-indigo-900 border-b-2 border-slate-300 pb-2 inline-block px-10 mb-8">{userName}</p>
        <p className="text-slate-600 mb-3 italic">ha completado satisfactoriamente el módulo:</p>
        <p className="text-2xl font-bold text-slate-800 mb-10">{levelTitle}</p>
        <div className="bg-slate-50 inline-block px-6 py-2 rounded-lg border mb-12">
          <p className="text-xs uppercase font-semibold">Calificación</p>
          <p className="text-2xl font-black text-indigo-600">{score} / {maxScore}</p>
        </div>
        <div className="flex justify-between items-end px-10">
          <div className="text-left w-1/3">
            <div className="border-b border-slate-400 pb-1 font-medium">{new Date(date).toLocaleDateString()}</div>
            <p className="text-xs text-slate-500 mt-1 uppercase">Fecha</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-yellow-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-right w-1/3">
            <div className="border-b border-slate-400 pb-1 font-serif text-lg italic opacity-80">David Castillo</div>
            <p className="text-xs text-slate-500 mt-1 uppercase">Facilitador</p>
          </div>
        </div>
      </div>
    </div>
  );
}

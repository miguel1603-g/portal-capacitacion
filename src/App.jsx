import React, { useState, useEffect } from 'react';
import { 
  Settings, BookOpen, CheckCircle, XCircle, Award, 
  ChevronRight, Plus, Trash2, Edit, Save, User, 
  PlayCircle, FileText, Printer, ArrowLeft, Lock, ExternalLink,
  Link as LinkIcon, Download, Building, X, Users, UserCheck, UserX, Mail, Key, CreditCard, BarChart,
  MessageCircle, Clock, AlertTriangle, Upload, Copy
} from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE UNIFICADA ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBUEPxmjXb5hqfc8hW0tGO05IFvX8bjgLU",
  authDomain: "capacitacorp-db.firebaseapp.com",
  projectId: "capacitacorp-db",
  storageBucket: "capacitacorp-db.firebasestorage.app",
  messagingSenderId: "66322810405",
  appId: "1:66322810405:web:a59bb115aee16b532d61cc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- DATOS POR DEFECTO PARA NUEVOS ENTORNOS ---
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
  const [role, setRole] = useState('admin');
  const [adminAuth, setAdminAuth] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [globalProgress, setGlobalProgress] = useState({});
  const [loadingDb, setLoadingDb] = useState(true);

  const showDialog = (options) => setDialog(options);
  const closeDialog = () => setDialog(null);

  // --- CONEXIÓN EN TIEMPO REAL CON FIREBASE ---
  useEffect(() => {
    try {
      const unsubCompanies = onSnapshot(collection(db, 'companies'), (snapshot) => {
        if (snapshot.empty) {
          defaultCompanies.forEach(async (comp) => {
            await setDoc(doc(db, 'companies', comp.id), comp);
          });
        } else {
          const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCompanies(loaded);
        }
        setLoadingDb(false);
      }, (error) => {
        console.error("Error cargando empresas:", error);
        setLoadingDb(false);
      });

      const unsubProgress = onSnapshot(collection(db, 'progress'), (snapshot) => {
         const prog = {};
         snapshot.docs.forEach(doc => { prog[doc.id] = doc.data(); });
         setGlobalProgress(prog);
      });

      return () => { unsubCompanies(); unsubProgress(); };
    } catch (err) {
      console.warn("Ejecutando sin Firebase", err);
      setCompanies(defaultCompanies);
      setLoadingDb(false);
    }
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
    try { 
      if (db) await setDoc(doc(db, 'companies', updatedCompany.id), updatedCompany); 
      else setCompanies(companies.map(c => c.id === updatedCompany.id ? updatedCompany : c)); // Fallback
    } catch (error) { console.error("Error guardando empresa:", error); }
  };

  const handleDeleteCompany = async (companyId) => {
    try { 
      if (db) await deleteDoc(doc(db, 'companies', companyId)); 
      else setCompanies(companies.filter(c => c.id !== companyId)); // Fallback
    } catch (error) { console.error("Error eliminando empresa:", error); }
  };

  const handleUpdateProgress = async (progKey, newProgressData) => {
    try { 
      if (db) await setDoc(doc(db, 'progress', progKey), newProgressData); 
      else setGlobalProgress({...globalProgress, [progKey]: newProgressData}); // Fallback
    } catch (error) { console.error("Error guardando progreso:", error); }
  };

  // PANTALLA DE CARGA
  if (loadingDb) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-500 animate-pulse">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
          <p className="text-xl font-bold">Cargando Plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-40 print:hidden transition-all duration-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentCompanyId(null)}>
            <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600 hidden sm:block tracking-tight">CapacitaCorp e-Learning</h1>
              <h1 className="text-xl font-bold text-indigo-700 sm:hidden">CapacitaCorp</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            <button 
              onClick={() => { setRole('learner'); setCurrentCompanyId(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${role === 'learner' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              Colaborador
            </button>
            <button 
              onClick={() => { setRole('admin'); setCurrentCompanyId(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${role === 'admin' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 pb-24">
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

// ============================================================================
// COMPONENTES SECUNDARIOS
// ============================================================================

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
          let words = name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\b(s\.?a\.?|c\.?a\.?|cia|ltda|corp|de|del|la|el|los|las|y)\b/g, '').replace(/[^a-z0-9\s]+/g, '').split(/\s+/).filter(w => w.length > 0);
          let baseSlug = 'emp';
          if (words.length === 1) baseSlug = words[0].substring(0, 6);
          else if (words.length > 1) baseSlug = words.map(w => w[0]).join('').substring(0, 4);
          
          let finalSlug = baseSlug; let counter = 1;
          while (companies.find(c => c.id === finalSlug)) { finalSlug = `${baseSlug}${counter}`; counter++; }

          onUpdateCompany({ id: finalSlug, name: name.trim(), settings: { maxScore: 100, passingScore: 70 }, levels: [], users: [], pendingRequests: [] });
        }
      }
    });
  };

  const handleCloneCompany = (companyToClone, e) => {
    e.stopPropagation();
    showDialog({
      type: 'prompt',
      title: 'Duplicar Empresa',
      message: `Ingresa el nombre para la nueva empresa.\nSe copiará todo el material de estudio y preguntas de "${companyToClone.name}":`,
      placeholder: 'Ej: Nuevo Cliente S.A.',
      onConfirm: (newName) => {
        if (newName.trim()) {
          let words = newName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\b(s\.?a\.?|c\.?a\.?|cia|ltda|corp|de|del|la|el|los|las|y)\b/g, '').replace(/[^a-z0-9\s]+/g, '').split(/\s+/).filter(w => w.length > 0);
          let baseSlug = 'emp';
          if (words.length === 1) baseSlug = words[0].substring(0, 6);
          else if (words.length > 1) baseSlug = words.map(w => w[0]).join('').substring(0, 4);
          
          let finalSlug = baseSlug; let counter = 1;
          while (companies.find(c => c.id === finalSlug)) { finalSlug = `${baseSlug}${counter}`; counter++; }

          // Copiar niveles generando nuevos IDs
          const clonedLevels = JSON.parse(JSON.stringify(companyToClone.levels)).map(lvl => ({
            ...lvl,
            id: `lvl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
          }));

          const newCompany = {
            id: finalSlug,
            name: newName.trim(),
            logoUrl: companyToClone.logoUrl || '', 
            settings: JSON.parse(JSON.stringify(companyToClone.settings)),
            levels: clonedLevels,
            users: [], 
            pendingRequests: []
          };

          onUpdateCompany(newCompany);
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
    showDialog({ type: 'alert', title: 'Enlace Corto Generado', message: `Este es el link directo para los colaboradores:\n\n🔗 ${link}\n\nCódigo manual: "${id}"` });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header unificado y premium */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Ambientes de Capacitación</h2>
          <p className="text-slate-500 mt-2 font-medium">Gestiona los portales e-learning de cada empresa o cliente.</p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button onClick={handleAddCompany} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3.5 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 font-bold text-sm">
            <Plus className="w-5 h-5" /> <span>Crear Empresa</span>
          </button>
          <button onClick={onLogout} className="w-full sm:w-auto flex items-center justify-center text-sm font-bold text-slate-500 hover:text-rose-600 bg-slate-50 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 px-6 py-3.5 rounded-xl transition-colors">
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => (
          <div key={company.id} onClick={() => onSelectCompany(company.id)} className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden relative">
            
            {/* Overlay de Acciones (Esquina superior derecha) */}
            <div className="absolute top-4 right-4 flex gap-1.5 z-20">
              <button onClick={(e) => copyLink(company.id, e)} className="p-2.5 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 shadow-sm rounded-xl transition-colors" title="Copiar enlace directo">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button onClick={(e) => handleCloneCompany(company, e)} className="p-2.5 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 shadow-sm rounded-xl transition-colors opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0" title="Duplicar Empresa">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDeleteCompany(company.id); }} className="p-2.5 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 shadow-sm rounded-xl transition-colors opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0" title="Eliminar Portal">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido Principal */}
            <div className="p-6 md:p-8 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                {company.logoUrl ? <img src={company.logoUrl} className="w-full h-full object-contain p-2 rounded-2xl" alt="Logo"/> : <Building className="w-8 h-8" />}
              </div>
              
              <div className="mb-8">
                <h3 className="font-extrabold text-slate-800 text-xl md:text-2xl tracking-tight mb-2 line-clamp-1">{company.name}</h3>
                <span className="inline-block bg-slate-100 text-slate-500 font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-md">ID: {company.id}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> Usuarios</p>
                  <p className="font-black text-2xl text-slate-700">{(company.users || []).length}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5"/> Módulos</p>
                  <p className="font-black text-2xl text-slate-700">{(company.levels || []).length}</p>
                </div>
              </div>
            </div>
            
            {/* Pie de Tarjeta Interactivo */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 group-hover:bg-indigo-600 transition-colors duration-300">
              <div className="flex items-center justify-center space-x-2 text-indigo-600 group-hover:text-white font-bold text-sm transition-colors">
                <span>Configurar Portal</span> <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
  const [viewingCertificate, setViewingCertificate] = useState(null);

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

  const totalUsers = (company.users || []).length;
  const totalPending = (company.pendingRequests || []).length;
  const totalLevels = company.levels.length;

  return (
    <>
    <div className={`space-y-6 animate-in fade-in zoom-in duration-300 ${viewingCertificate ? 'print:hidden' : ''}`}>
      {/* Header Admin */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        <div className="flex items-center gap-5 relative z-10">
          <button onClick={onBack} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative group cursor-pointer" title="Subir o cambiar Logo">
            <label className="cursor-pointer block relative">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain bg-white rounded-2xl border border-slate-100 p-1.5 shadow-sm" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                  <Building className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{company.name}</h2>
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Panel de Administración</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-6 h-6" /></div>
          <div><p className="text-slate-500 text-sm font-medium">Colaboradores</p><p className="text-2xl font-bold text-slate-800">{totalUsers}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><UserCheck className="w-6 h-6" /></div>
          <div><p className="text-slate-500 text-sm font-medium">Solicitudes Pendientes</p><p className="text-2xl font-bold text-slate-800">{totalPending}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><BookOpen className="w-6 h-6" /></div>
          <div><p className="text-slate-500 text-sm font-medium">Módulos Activos</p><p className="text-2xl font-bold text-slate-800">{totalLevels}</p></div>
        </div>
      </div>

      {/* Pending Requests Alert */}
      {totalPending > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Tienes solicitudes de acceso por revisar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.pendingRequests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-xl border border-orange-100 flex flex-col justify-between shadow-sm">
                <div className="mb-4">
                  <p className="font-bold text-slate-800 flex items-center gap-2"><User className="w-4 h-4 text-slate-400"/>{req.name}</p>
                  <div className="text-sm text-slate-500 mt-2 grid grid-cols-2 gap-y-1">
                    <span><span className="font-medium">C.I:</span> {req.cedula}</span>
                    <span><span className="font-medium">Tel:</span> {req.phone}</span>
                    <span className="col-span-2"><span className="font-medium">Email:</span> {req.email}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveRequest(req)} className="flex-1 flex justify-center items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors">
                    <UserCheck className="w-4 h-4 mr-1"/> Permitir
                  </button>
                  <button onClick={() => rejectRequest(req.id)} className="flex-1 flex justify-center items-center px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-sm font-bold transition-colors">
                    <UserX className="w-4 h-4 mr-1"/> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colaboradores List */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Colaboradores
            </h3>
            <button onClick={handleDownloadReport} className="flex items-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-colors text-sm font-bold shadow-sm">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {(!company.users || company.users.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Users className="w-12 h-12 mb-2 opacity-50" />
                <p>No hay colaboradores activos.</p>
              </div>
            ) : (
              company.users.map(user => {
                const userProg = globalProgress ? (globalProgress[`${company.id}_${user.id}`] || {}) : {};
                let passedCount = 0;
                let nextPendingLevel = null;
                
                company.levels.forEach(lvl => { 
                  if (userProg[lvl.id]?.passed) passedCount++; 
                  else if (!nextPendingLevel) nextPendingLevel = lvl;
                });

                const progressPct = totalLevels > 0 ? Math.round((passedCount / totalLevels) * 100) : 0;

                const handleSendWA = () => {
                  if (!user.phone) { showDialog({type:'alert', title:'Error', message:'El usuario no tiene número registrado.'}); return; }
                  if (!nextPendingLevel) { showDialog({type:'alert', title:'Aprobado', message:'El usuario ya aprobó todo.'}); return; }
                  const msg = `Hola ${user.name},\nTe recordamos que tienes módulos pendientes en el portal de ${company.name}. El módulo "${nextPendingLevel.title}" vence el ${nextPendingLevel.deadline || 'pronto'}. Pasada esa fecha se bloqueará tu acceso. Por favor, completa tu evaluación.`;
                  
                  let phone = user.phone.replace(/[^0-9]/g, '');
                  if (phone.startsWith('09') && phone.length === 10) phone = '593' + phone.substring(1);

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
                  <div key={user.id} className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                          {user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 leading-tight">{user.name}</h4>
                          <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleSendWA} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Notificar por WhatsApp"><MessageCircle className="w-4 h-4" /></button>
                        <button onClick={handleSendEmail} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Notificar por Correo"><Mail className="w-4 h-4" /></button>
                        <button onClick={() => {
                          showDialog({ type: 'confirm', title: 'Revocar Acceso', message: '¿Eliminar acceso a este usuario?', onConfirm: () => onUpdateCompany({ ...company, users: company.users.filter(u => u.id !== user.id) }) });
                        }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Eliminar Acceso"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    
                    {/* User Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                         <div className="bg-indigo-500 h-full rounded-full" style={{width: `${progressPct}%`}}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{passedCount}/{totalLevels}</span>
                    </div>

                    {company.levels.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 custom-scrollbar">
                        {company.levels.map((lvl, i) => {
                          const lvlStatus = userProg[lvl.id];
                          const isPassed = lvlStatus?.passed;
                          return (
                            <div 
                              key={lvl.id} 
                              onClick={() => {
                                if (isPassed) {
                                  setViewingCertificate({
                                    userName: user.name,
                                    levelTitle: lvl.title,
                                    score: lvlStatus.score,
                                    maxScore: company.settings.maxScore,
                                    date: lvlStatus.completedAt || new Date().toISOString(),
                                    companyName: company.name,
                                    companyLogo: company.logoUrl
                                  });
                                }
                              }}
                              className={`flex-shrink-0 text-[10px] px-2 py-1 rounded-md border font-bold flex items-center gap-1 transition-colors ${isPassed ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer hover:bg-emerald-100' : lvlStatus ? 'bg-rose-50 text-rose-700 border-rose-200 cursor-default' : 'bg-slate-50 text-slate-400 border-slate-100 cursor-default'}`} 
                              title={isPassed ? `Ver certificado de ${lvl.title}` : lvl.title}
                            >
                              M{i+1}: {lvlStatus ? lvlStatus.score : '-'}
                              {isPassed && <Award className="w-3 h-3" />}
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

        {/* Learning Path */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" /> Ruta de Aprendizaje
            </h3>
            <button onClick={addNewLevel} className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all text-sm font-bold flex items-center gap-2">
              <Plus className="w-4 h-4"/> Añadir Módulo
            </button>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar relative before:absolute before:inset-y-0 before:left-6 before:w-0.5 before:bg-slate-100">
            {company.levels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 relative z-10 bg-white">
                <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                <p>No has creado ningún módulo aún.</p>
              </div>
            ) : (
              company.levels.map((lvl, index) => (
                <div key={lvl.id} className="relative z-10 flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-sm flex-shrink-0 group-hover:border-indigo-500 group-hover:bg-indigo-50 transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-indigo-100 transition-all flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-800">{lvl.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span><FileText className="w-3 h-3 inline mr-1" /> {(lvl.materials || []).length} Recursos</span>
                        <span><Award className="w-3 h-3 inline mr-1" /> {(lvl.questions || []).length} Preguntas</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingLevel(lvl)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteLevel(lvl.id)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Visor de Certificados para el Administrador */}
      {viewingCertificate && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:static print:bg-white print:p-0 print:block">
           <div className="bg-white p-4 md:p-8 rounded-3xl max-w-4xl w-full max-h-screen overflow-y-auto print:p-0 print:shadow-none print:max-h-none print:w-full custom-scrollbar relative">
              <div className="flex justify-between items-center mb-6 print:hidden sticky top-0 bg-white/90 backdrop-blur-md z-20 pb-4 border-b border-slate-100 pt-2">
                 <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800"><Award className="w-5 h-5 text-indigo-600"/> Certificado de {viewingCertificate.userName}</h3>
                 <div className="flex gap-2">
                   <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-colors"><Printer className="w-4 h-4"/> Imprimir</button>
                   <button onClick={() => setViewingCertificate(null)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"><X className="w-5 h-5"/></button>
                 </div>
              </div>
              <Certificate {...viewingCertificate} />
           </div>
         </div>
      )}
    </>
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
    <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
        <Lock className="w-10 h-10 text-indigo-500" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Acceso a Capacitación</h2>
      <p className="text-slate-500 mb-8 text-sm leading-relaxed">Ingresa el código corto proporcionado por tu empresa o pega el enlace directo para continuar.</p>
      <form onSubmit={handleSubmit}>
        <input type="text" value={code} onChange={e => { setCode(e.target.value); setError(''); }} placeholder="Ej: emp1 o enlace" className="w-full p-4 border border-slate-200 rounded-xl mb-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-center text-lg font-medium transition-all" />
        {error && <p className="text-red-500 text-sm mb-4 font-medium animate-in slide-in-from-top-1">{error}</p>}
        <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-bold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all hover:-translate-y-0.5">Ingresar al Portal</button>
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

  // Calcular progreso total
  const passedLevelsCount = company.levels.filter(lvl => userProgress[lvl.id]?.passed).length;
  const totalLevels = company.levels.length;
  const progressPercentage = totalLevels > 0 ? Math.round((passedLevelsCount / totalLevels) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
      
      {/* Hero Section / Resumen de Progreso */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain bg-white rounded-2xl border border-slate-100 p-2 shadow-sm" />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                <Building className="w-8 h-8" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-1">{company.name}</p>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hola, {loggedUser.name.split(' ')[0]}</h2>
              <p className="text-slate-500 mt-1">Continúa tu camino de aprendizaje hoy.</p>
            </div>
          </div>
          
          <div className="w-full md:w-auto bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-5">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-indigo-600 transition-all duration-1000 ease-out" strokeDasharray={`${progressPercentage}, 100`} strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-sm font-bold text-slate-700">{progressPercentage}%</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Progreso General</p>
              <p className="text-xs text-slate-500">{passedLevelsCount} de {totalLevels} módulos completados</p>
            </div>
          </div>
        </div>
        <button onClick={() => setLoggedUser(null)} className="absolute top-6 right-6 text-sm text-slate-400 hover:text-red-500 font-medium transition-colors flex items-center gap-1">
          Cerrar sesión
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" /> Ruta de Aprendizaje
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {company.levels.map((lvl, index) => {
            const status = userProgress[lvl.id];
            const isLockedByPrev = index > 0 && !userProgress[company.levels[index - 1].id]?.passed;
            
            const todayStr = new Date().toISOString().split('T')[0];
            const isExpired = lvl.deadline && !status?.passed && todayStr > lvl.deadline;
            const isLocked = isLockedByPrev || isExpired;

            return (
              <div key={lvl.id} className={`group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col overflow-hidden ${isLocked ? 'opacity-80' : 'hover:-translate-y-1 hover:border-indigo-100'}`}>
                
                {/* Overlays */}
                {isLockedByPrev && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-3xl">
                    <div className="bg-white p-4 rounded-full shadow-md mb-3"><Lock className="w-6 h-6 text-slate-400" /></div>
                    <span className="text-sm font-bold text-slate-600">Módulo Bloqueado</span>
                    <span className="text-xs text-slate-500 mt-1 font-medium bg-white/80 px-3 py-1 rounded-full">Aprueba el nivel anterior</span>
                  </div>
                )}
                {isExpired && !isLockedByPrev && (
                  <div className="absolute inset-0 bg-red-50/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-3xl border border-red-100">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-3"><AlertTriangle className="w-8 h-8 text-red-500" /></div>
                    <span className="text-sm font-bold text-red-600">Módulo Expirado</span>
                    <span className="text-xs text-slate-600 mt-1 px-6 text-center font-medium">La fecha límite fue el {lvl.deadline}. Contacta a RRHH.</span>
                  </div>
                )}
                
                {/* Card Header */}
                <div className={`p-6 border-b border-slate-50 ${status?.passed ? 'bg-gradient-to-br from-emerald-50 to-white' : status ? 'bg-gradient-to-br from-red-50 to-white' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${status?.passed ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : status ? 'bg-red-100 text-red-700 border-red-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                      Módulo {index + 1}
                    </span>
                    {status?.passed && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    {status && !status.passed && <XCircle className="w-5 h-5 text-red-400" />}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2 pr-4">{lvl.title}</h3>
                  {lvl.deadline && !status?.passed && (
                    <p className={`text-xs font-semibold flex items-center ${isExpired ? 'text-red-500' : 'text-orange-500'}`}>
                      <Clock className="w-3.5 h-3.5 mr-1.5"/> Límite: {new Date(lvl.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-end bg-white">
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Calificación</p>
                      {status ? (
                        <p className={`font-black text-2xl ${status.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                          {status.score} <span className="text-sm font-medium text-slate-400">/ {company.settings.maxScore}</span>
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-slate-600">Min. {company.settings.passingScore} pts</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveLevel(lvl)} 
                    disabled={isLocked} 
                    className={`w-full py-3.5 rounded-xl font-bold transition-all ${status?.passed ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg'}`}
                  >
                    {status?.passed ? 'Repasar Material' : status ? 'Reintentar Módulo' : 'Comenzar Ahora'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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

  const handleOpenMaterial = (e, mat) => {
    if (mat.url && mat.url.startsWith('data:')) {
      e.preventDefault();
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

  const answeredCount = Object.keys(answers).length;
  const totalQs = level.questions.length;
  const progressPct = totalQs > 0 ? Math.round((answeredCount / totalQs) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6 print:hidden">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 font-bold bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> <span>Volver a la ruta</span>
        </button>
      </div>

      {view === 'material' && (
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-in slide-in-from-bottom-4 duration-500 print:hidden relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0"></div>
          
          <div className="relative z-10">
            <span className="text-indigo-600 font-bold text-sm tracking-widest uppercase mb-2 block">Material de Estudio</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-8 leading-tight">{level.title}</h2>
            
            <div className="prose prose-slate prose-lg max-w-none mb-12 whitespace-pre-wrap text-slate-600 leading-relaxed">
              {level.content}
            </div>

            {level.materials?.length > 0 && (
              <div className="mb-12 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Recursos Adicionales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {level.materials.map(mat => (
                    <a 
                      key={mat.id} 
                      href={mat.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={(e) => handleOpenMaterial(e, mat)}
                      className="group flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mr-4 flex-shrink-0">
                        {mat.type === 'pdf' ? <FileText className="w-6 h-6 text-rose-500 group-hover:text-rose-600"/> : 
                         mat.type === 'video' ? <PlayCircle className="w-6 h-6 text-amber-500 group-hover:text-amber-600"/> : 
                         <ExternalLink className="w-6 h-6 text-blue-500 group-hover:text-blue-600"/>}
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-slate-700 text-sm truncate block group-hover:text-indigo-700 transition-colors">{mat.title || 'Ver material'}</span>
                        <span className="text-xs text-slate-400 font-medium mt-0.5 block">{mat.type === 'pdf' && mat.url.startsWith('data:') ? 'Descargar documento' : 'Abrir en nueva pestaña'}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end pt-8 border-t border-slate-100 gap-4 mt-8">
               {progress?.passed && (
                 <button onClick={() => setView('certificate')} className="px-8 py-3.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-2">
                   <Award className="w-5 h-5"/> Ver Certificado
                 </button>
               )}
               <button onClick={() => { setAnswers({}); setQuizSubmitted(false); setView('quiz'); }} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                 {progress?.passed ? 'Repetir Evaluación' : 'Iniciar Evaluación'} <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      )}
      
      {view === 'quiz' && !quizSubmitted && (
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-in slide-in-from-right-8 duration-300 print:hidden relative overflow-hidden">
          {/* Progress Bar Top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
            <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{width: `${progressPct}%`}}></div>
          </div>

          <div className="mb-10 text-center mt-4">
            <span className="text-indigo-600 font-bold text-sm tracking-widest uppercase mb-2 block">Evaluación de Conocimientos</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-6">{level.title}</h2>
            
            <div className="inline-flex flex-wrap justify-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Award className="w-4 h-4 text-indigo-500"/> Max: <strong>{settings.maxScore} pts</strong></div>
              <div className="w-px h-5 bg-slate-300 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-slate-600"><CheckCircle className="w-4 h-4 text-emerald-500"/> Min. para aprobar: <strong>{settings.passingScore} pts</strong></div>
              <div className="w-px h-5 bg-slate-300 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold">Completado: {answeredCount} / {totalQs}</div>
            </div>
          </div>

          <div className="space-y-8 mb-10">
            {level.questions.map((q, qIndex) => (
              <div key={q.id} className="animate-in fade-in slide-in-from-bottom-4" style={{animationDelay: `${qIndex * 100}ms`}}>
                <h3 className="font-bold text-lg text-slate-800 mb-4 leading-snug">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 mr-3 text-sm">{qIndex + 1}</span> 
                  {q.text}
                </h3>
                <div className="grid gap-3 ml-11">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = answers[qIndex] === optIndex;
                    return (
                      <label 
                        key={optIndex} 
                        className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 group ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-100 hover:border-indigo-300 hover:bg-slate-50'}`}
                      >
                        <input 
                          type="radio" 
                          name={`q-${q.id}`} 
                          className="hidden" 
                          checked={isSelected} 
                          onChange={() => setAnswers({...answers, [qIndex]: optIndex})} 
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-400 bg-white'}`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`ml-4 font-medium text-base ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {level.questions.length > 0 && (
            <div className="flex justify-end pt-8 border-t border-slate-100">
              <button 
                onClick={submitQuiz} 
                disabled={answeredCount < totalQs} 
                className={`w-full sm:w-auto px-10 py-4 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${answeredCount < totalQs ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-800 hover:bg-slate-900 hover:-translate-y-1 text-white'}`}
              >
                Enviar Respuestas <ChevronRight className="w-5 h-5"/>
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'quiz' && quizSubmitted && (
        <div className="bg-white p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center animate-in zoom-in duration-500 print:hidden relative overflow-hidden">
          {currentScore >= settings.passingScore ? (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white opacity-70"></div>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50 via-white to-white opacity-70"></div>
          )}
          
          <div className="relative z-10">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl ${currentScore >= settings.passingScore ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-rose-500 text-white shadow-rose-200'}`}>
              {currentScore >= settings.passingScore ? <Award className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
              {currentScore >= settings.passingScore ? '¡Felicidades, Aprobaste!' : 'No alcanzaste el mínimo requerido'}
            </h2>
            <p className="text-slate-500 font-medium mb-8">
              {currentScore >= settings.passingScore ? 'Has completado este módulo con éxito.' : 'Te sugerimos repasar el material e intentarlo nuevamente.'}
            </p>
            
            <div className="flex flex-col items-center justify-center mb-10">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Tu Calificación</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-7xl font-black tracking-tighter ${currentScore >= settings.passingScore ? 'text-emerald-600' : 'text-rose-600'}`}>{currentScore}</span>
                <span className="text-2xl font-bold text-slate-300">/ {settings.maxScore}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => setView('material')} className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                Volver al Material
              </button>
              {currentScore >= settings.passingScore ? (
                <button onClick={() => setView('certificate')} className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5"/> Ver Certificado
                </button>
              ) : (
                <button onClick={() => { setAnswers({}); setQuizSubmitted(false); }} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                  Reintentar Evaluación
                </button>
              )}
            </div>
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

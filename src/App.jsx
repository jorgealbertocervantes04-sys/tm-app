import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Truck,
  Users,
  Activity,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  LogOut,
  TrendingUp,
  AlertOctagon,
  Award,
} from 'lucide-react';

// Diccionario de evaluación basado en estándares de mejora continua
const EVALUATION_CATEGORIES = [
  {
    id: 'appearance',
    title: 'Imagen y Vestimenta',
    icon: <User className="w-6 h-6 text-blue-500" />,
    description: 'Alineación con la identidad corporativa y normativas de EPP.',
    questions: [
      { id: 'app_1', text: 'Uso correcto del uniforme (limpieza y estado).' },
      {
        id: 'app_2',
        text: 'Porta y utiliza correctamente el Equipo de Protección Personal (EPP).',
      },
      {
        id: 'app_3',
        text: 'Higiene personal y presentación general adecuada.',
      },
    ],
  },
  {
    id: 'conduct',
    title: 'Conducta y Actitud',
    icon: <Activity className="w-6 h-6 text-indigo-500" />,
    description: 'Comportamiento general durante la jornada o prueba.',
    questions: [
      {
        id: 'cond_1',
        text: 'Muestra disposición y acata instrucciones sin resistencia.',
      },
      { id: 'cond_2', text: 'Puntualidad y manejo eficiente de los tiempos.' },
      {
        id: 'cond_3',
        text: 'Mantiene la calma bajo presión o indicaciones de corrección.',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Cultura de Seguridad',
    icon: <ShieldCheck className="w-6 h-6 text-red-500" />,
    description:
      'Percepción del riesgo y respeto a los protocolos de la empresa.',
    questions: [
      {
        id: 'safe_1',
        text: 'Realiza inspección 360 y revisión pre-operativa (check-list).',
      },
      {
        id: 'safe_2',
        text: 'Respeta límites de velocidad y señalizaciones internas/externas.',
      },
      {
        id: 'safe_3',
        text: 'Identifica riesgos en el entorno antes de iniciar maniobras.',
      },
    ],
  },
  {
    id: 'skills',
    title: 'Habilidad de Manejo',
    icon: <Truck className="w-6 h-6 text-emerald-500" />,
    description: 'Destreza técnica en la operación de la unidad.',
    questions: [
      {
        id: 'skill_1',
        text: 'Dominio de las dimensiones del vehículo en maniobras complejas.',
      },
      {
        id: 'skill_2',
        text: 'Suavidad en aceleración, frenado y cambios de marcha (cuidado de la unidad).',
      },
      {
        id: 'skill_3',
        text: 'Conocimiento técnico del tablero y funciones del vehículo.',
      },
    ],
  },
  {
    id: 'social',
    title: 'Socialización y Trato',
    icon: <Users className="w-6 h-6 text-orange-500" />,
    description: 'Habilidades blandas e interacción con el ecosistema TM.',
    questions: [
      {
        id: 'soc_1',
        text: 'Se dirige con respeto a instructores, guardias y personal de patio.',
      },
      {
        id: 'soc_2',
        text: 'Claridad en su comunicación al reportar novedades o dudas.',
      },
      {
        id: 'soc_3',
        text: 'Demuestra empatía y actitud de colaboración con otros compañeros.',
      },
    ],
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, setup, evaluation, results

  // Estado de la evaluación actual
  const [operatorData, setOperatorData] = useState({
    name: '',
    idNumber: '',
    type: 'nuevo', // 'nuevo' o 'actual'
    evaluator: 'Instructor Juan P.',
  });

  const [scores, setScores] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [evaluationResults, setEvaluationResults] = useState(null);

  // Manejadores de navegación
  const startNewEvaluation = () => {
    setOperatorData({
      name: '',
      idNumber: '',
      type: 'nuevo',
      evaluator: 'Instructor Juan P.',
    });
    setScores({});
    setCurrentStep(0);
    setEvaluationResults(null);
    setCurrentView('setup');
  };

  const handleSetupSubmit = (e) => {
    e.preventDefault();
    if (operatorData.name && operatorData.idNumber) {
      setCurrentView('evaluation');
    }
  };

  const handleScoreChange = (questionId, score) => {
    setScores((prev) => ({ ...prev, [questionId]: parseInt(score) }));
  };

  const isCurrentStepComplete = () => {
    const currentQuestions = EVALUATION_CATEGORIES[currentStep].questions;
    return currentQuestions.every((q) => scores[q.id] !== undefined);
  };

  const nextStep = () => {
    if (currentStep < EVALUATION_CATEGORIES.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishEvaluation();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const finishEvaluation = () => {
    // Calcular promedios por categoría
    const categoryScores = EVALUATION_CATEGORIES.map((cat) => {
      const catScores = cat.questions.map((q) => scores[q.id] || 0);
      const average = catScores.reduce((a, b) => a + b, 0) / catScores.length;
      return { ...cat, average: average.toFixed(1) };
    });

    const overallScore = (
      categoryScores.reduce((acc, cat) => acc + parseFloat(cat.average), 0) /
      categoryScores.length
    ).toFixed(1);

    // Detección de Focos Rojos (Calificaciones <= 2 en cualquier pregunta)
    const redFlags = [];
    EVALUATION_CATEGORIES.forEach((cat) => {
      cat.questions.forEach((q) => {
        if (scores[q.id] <= 2) {
          redFlags.push(`Categoría '${cat.title}': ${q.text}`);
        }
      });
    });

    // Encontrar el área más débil para la recomendación principal
    const weakestCategory = [...categoryScores].sort(
      (a, b) => parseFloat(a.average) - parseFloat(b.average)
    )[0];

    // Generar recomendaciones basadas en el tipo de operador y puntaje
    let verdict = {};
    let recommendations = [];

    if (operatorData.type === 'nuevo') {
      if (overallScore >= 4.0 && redFlags.length === 0) {
        verdict = {
          status: 'Aprobado',
          color: 'text-green-600',
          bg: 'bg-green-100',
          text: 'Candidato Excelente. Apto para contratación inmediata.',
        };
        recommendations.push(
          'Asignar a ruta/equipo de alta prioridad rápidamente para aprovechar su nivel.'
        );
      } else if (overallScore >= 3.0 && redFlags.length <= 2) {
        verdict = {
          status: 'Condicionado',
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          text: 'Candidato con potencial. Requiere inducción focalizada.',
        };
        recommendations.push(
          `Contratar bajo esquema de prueba con énfasis en capacitación sobre: ${weakestCategory.title}.`
        );
        if (redFlags.length > 0)
          recommendations.push(
            'Revisar urgentemente los focos rojos detectados durante su primera semana.'
          );
      } else {
        verdict = {
          status: 'No Apto',
          color: 'text-red-600',
          bg: 'bg-red-100',
          text: 'No cumple con los estándares mínimos de la empresa.',
        };
        recommendations.push(
          'Descartar candidato. Los riesgos operativos o actitudinales son demasiado altos.'
        );
      }
    } else {
      // Lógica para Plantilla Actual
      if (overallScore >= 4.2) {
        verdict = {
          status: 'Talento Destacado',
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          text: 'Operador modelo. Apto para ser formador interno.',
        };
        recommendations.push(
          'Considerar para programa de incentivos o plan de carrera como Instructor/Mentor.'
        );
      } else if (overallScore >= 3.2) {
        verdict = {
          status: 'Estándar / En Desarrollo',
          color: 'text-emerald-600',
          bg: 'bg-emerald-100',
          text: 'Operador confiable, pero con áreas de oportunidad claras.',
        };
        recommendations.push(
          `Agendar curso de reforzamiento enfocado específicamente en: ${weakestCategory.title}.`
        );
        recommendations.push('Monitorear evolución en los próximos 3 meses.');
      } else {
        verdict = {
          status: 'Riesgo Operativo',
          color: 'text-red-600',
          bg: 'bg-red-100',
          text: 'Requiere intervención inmediata por parte de RRHH y Operaciones.',
        };
        recommendations.push(
          'Suspender labores de alto riesgo temporalmente (si aplica).'
        );
        recommendations.push(
          `Implementar Plan de Mejora Continua (PIP) urgente enfocado en corregir: ${weakestCategory.title} y los focos rojos detectados.`
        );
      }
    }

    setEvaluationResults({
      categoryScores,
      overallScore,
      redFlags,
      verdict,
      recommendations,
      weakestCategory,
    });

    setCurrentView('results');
  };

  // --- Vistas ---
  const renderDashboard = () => (
    <div className="p-6 max-w-md mx-auto h-screen bg-slate-50 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            TM EvalPro <span className="text-blue-600">360</span>
          </h1>
          <p className="text-sm text-slate-500">Panel de Instructores</p>
        </div>
        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <User className="text-white w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Evals Hoy
          </p>
          <p className="text-3xl font-bold text-slate-800">4</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Pendientes
          </p>
          <p className="text-3xl font-bold text-slate-800">2</p>
        </div>
      </div>

      <button
        onClick={startNewEvaluation}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2 mb-8"
      >
        <ClipboardList className="w-5 h-5" />
        <span>Iniciar Nueva Evaluación</span>
      </button>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Evaluaciones Recientes
        </h3>
        <div className="space-y-3">
          {[
            {
              name: 'Carlos Mendoza',
              type: 'Nuevo Ingreso',
              score: '4.2',
              date: 'Hoy, 10:30 AM',
            },
            {
              name: 'Roberto Díaz',
              type: 'Plantilla Actual',
              score: '2.8',
              date: 'Ayer, 16:15 PM',
            },
          ].map((evalItem, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-slate-800">{evalItem.name}</p>
                <p className="text-xs text-slate-500">
                  {evalItem.type} • {evalItem.date}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  parseFloat(evalItem.score) >= 4
                    ? 'bg-green-100 text-green-700'
                    : parseFloat(evalItem.score) >= 3
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {evalItem.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="p-6 max-w-md mx-auto h-screen bg-white flex flex-col">
      <button
        onClick={() => setCurrentView('dashboard')}
        className="text-slate-400 hover:text-slate-600 mb-6 w-fit"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Datos del Evaluado
      </h2>
      <p className="text-slate-500 mb-8">
        Ingresa la información básica para iniciar la auditoría de competencias.
      </p>

      <form onSubmit={handleSetupSubmit} className="flex-1 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej. Luis Ramírez"
            value={operatorData.name}
            onChange={(e) =>
              setOperatorData({ ...operatorData, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Número de Empleado / ID Candidato
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej. TM-2094"
            value={operatorData.idNumber}
            onChange={(e) =>
              setOperatorData({ ...operatorData, idNumber: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Tipo de Evaluación
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setOperatorData({ ...operatorData, type: 'nuevo' })
              }
              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center justify-center space-y-2 ${
                operatorData.type === 'nuevo'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <User className="w-6 h-6" />
              <span>Nuevo Ingreso</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setOperatorData({ ...operatorData, type: 'actual' })
              }
              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center justify-center space-y-2 ${
                operatorData.type === 'actual'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Users className="w-6 h-6" />
              <span>Plantilla Actual</span>
            </button>
          </div>
        </div>

        <div className="pt-8 mt-auto">
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>Comenzar Auditoría</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );

  const renderEvaluation = () => {
    const category = EVALUATION_CATEGORIES[currentStep];
    const progress = (currentStep / EVALUATION_CATEGORIES.length) * 100;

    return (
      <div className="max-w-md mx-auto h-screen bg-slate-50 flex flex-col">
        {/* Header de Evaluación */}
        <div className="bg-white p-6 shadow-sm border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`p-2 rounded-full ${
                currentStep === 0
                  ? 'text-slate-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Módulo {currentStep + 1} de {EVALUATION_CATEGORIES.length}
              </p>
              <h2 className="text-lg font-bold text-slate-800">
                {category.title}
              </h2>
            </div>
            <div className="w-10"></div> {/* Spacer */}
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Contenido de Evaluación */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              {category.icon}
            </div>
            <p className="text-sm text-slate-600 font-medium">
              {category.description}
            </p>
          </div>

          {category.questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"
            >
              <p className="font-semibold text-slate-800 mb-4">
                {idx + 1}. {q.text}
              </p>

              <div className="flex justify-between items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleScoreChange(q.id, rating)}
                    className={`w-12 h-12 rounded-full font-bold text-lg transition-all border-2 
                      ${
                        scores[q.id] === rating
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-110'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-300'
                      }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2 px-1 font-medium">
                <span>Deficiente</span>
                <span>Excelente</span>
              </div>
            </div>
          ))}
        </div>

        {/* Botón de Siguiente/Finalizar */}
        <div className="p-6 bg-white border-t border-slate-100">
          <button
            onClick={nextStep}
            disabled={!isCurrentStepComplete()}
            className={`w-full font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 
              ${
                isCurrentStepComplete()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
          >
            <span>
              {currentStep === EVALUATION_CATEGORIES.length - 1
                ? 'Finalizar Auditoría'
                : 'Siguiente Módulo'}
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!evaluationResults) return null;
    const {
      overallScore,
      categoryScores,
      redFlags,
      verdict,
      recommendations,
      weakestCategory,
    } = evaluationResults;

    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-slate-900 pt-8 pb-16 px-6 rounded-b-3xl shadow-lg relative">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="absolute top-6 right-6 text-white/70 hover:text-white"
          >
            <LogOut className="w-6 h-6" />
          </button>

          <div className="text-center text-white mt-4">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">
              Resultados de Evaluación
            </h2>
            <h1 className="text-2xl font-bold mb-1">{operatorData.name}</h1>
            <p className="text-slate-400 text-sm">
              {operatorData.idNumber} •{' '}
              {operatorData.type === 'nuevo'
                ? 'Candidato'
                : 'Colaborador Actual'}
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={60 * 2 * Math.PI}
                  strokeDashoffset={
                    60 * 2 * Math.PI -
                    (((overallScore / 5) * 100) / 100) * (60 * 2 * Math.PI)
                  }
                  className={`${
                    overallScore >= 4
                      ? 'text-green-400'
                      : overallScore >= 3
                      ? 'text-yellow-400'
                      : 'text-red-500'
                  } transition-all duration-1000`}
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-3xl font-bold text-white">
                  {overallScore}
                </span>
                <span className="block text-xs text-slate-400">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 -mt-8 flex-1 pb-10">
          {/* Tarjeta de Dictamen */}
          <div
            className={`bg-white p-5 rounded-2xl shadow-lg border border-slate-100 mb-6`}
          >
            <div
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold mb-3 ${verdict.bg} ${verdict.color}`}
            >
              {verdict.status === 'Aprobado' ||
              verdict.status === 'Talento Destacado' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertOctagon className="w-4 h-4" />
              )}
              <span>Dictamen Final</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {verdict.status}
            </h3>
            <p className="text-sm text-slate-600">{verdict.text}</p>
          </div>

          {/* Desglose de Categorías */}
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 mt-8 flex items-center space-x-2">
            <Activity className="w-4 h-4" />{' '}
            <span>Desglose por Competencia</span>
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-4 mb-6">
            {categoryScores.map((cat) => (
              <div key={cat.id}>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-semibold text-slate-700">
                    {cat.title}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {cat.average}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      parseFloat(cat.average) >= 4
                        ? 'bg-green-500'
                        : parseFloat(cat.average) >= 3
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(parseFloat(cat.average) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Sección de Mejora Continua (Recomendaciones) */}
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />{' '}
            <span>Plan de Acción / Recomendaciones</span>
          </h3>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <div className="mt-0.5 bg-blue-200 p-1 rounded-full">
                    <ChevronRight className="w-3 h-3 text-blue-700" />
                  </div>
                  <span className="text-sm text-blue-900 font-medium">
                    {rec}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Focos Rojos (Solo si existen) */}
          {redFlags.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />{' '}
                <span>Focos Rojos Detectados</span>
              </h3>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 space-y-3">
                <p className="text-xs font-semibold text-red-800 mb-2">
                  Comportamientos calificados como deficientes (≤2):
                </p>
                {redFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 text-sm text-red-700 bg-white p-3 rounded-lg border border-red-100 shadow-sm"
                  >
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl shadow-lg transition-all"
          >
            Guardar y Volver al Panel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans antialiased text-slate-900">
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'setup' && renderSetup()}
      {currentView === 'evaluation' && renderEvaluation()}
      {currentView === 'results' && renderResults()}
    </div>
  );
}

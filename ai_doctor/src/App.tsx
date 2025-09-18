import React, { useState, useRef } from 'react';
import {
  Heart, Thermometer, Activity, Upload, AlertTriangle, CheckCircle,
  Clock, FileText, User, Stethoscope, TrendingUp, AlertCircle,
  Shield, Eye, Download, Plus, X
} from 'lucide-react';
import { ChatPanel } from './ChatPanel';
// --- CHILD COMPONENTS ---

const PatientInputForm = ({
  patientData, setPatientData,
  symptoms, setSymptoms,
  vitals, setVitals,
  labReport, setLabReport,
  healthRecord, setHealthRecord,
  onGenerateReport // NEW: Changed prop for clarity
}) => {
  const [newSymptom, setNewSymptom] = useState('');
  const labReportRef = useRef(null);
  const healthRecordRef = useRef(null);

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setSymptoms([...symptoms, { name: newSymptom, duration: '', severity: 'mild' }]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const updateSymptom = (index, field, value) => {
    const updated = symptoms.map((symptom, i) =>
      i === index ? { ...symptom, [field]: value } : symptom
    );
    setSymptoms(updated);
  };

  const handleFileChange = (event, setFile) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Diagnostic Assistant</h1>
        <p className="text-blue-100">Please provide your health information for AI-powered diagnostic analysis</p>
      </div>

      {/* Patient Information */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <User className="text-indigo-600 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
        </div>
        {/* NEW: Grid is now 6 columns to accommodate new fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {/* NEW: Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Bob"
              value={patientData.name}
              onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Years"
              value={patientData.age}
              onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={patientData.gender}
              onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="kg"
              value={patientData.weight}
              onChange={(e) => setPatientData({ ...patientData, weight: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="cm"
              value={patientData.height}
              onChange={(e) => setPatientData({ ...patientData, height: e.target.value })}
            />
          </div>
          {/* NEW: Blood Group Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., B+"
              value={patientData.blood_group}
              onChange={(e) => setPatientData({ ...patientData, blood_group: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Symptoms Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <Stethoscope className="text-red-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Current Symptoms</h2>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter a symptom (e.g., headache, fever)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={newSymptom}
            onChange={(e) => setNewSymptom(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
          />
          <button onClick={addSymptom} className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-4">
          {symptoms.map((symptom, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800">{symptom.name}</h3>
                <button onClick={() => removeSymptom(index)} className="text-red-500 hover:text-red-700">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Duration</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    value={symptom.duration}
                    onChange={(e) => updateSymptom(index, 'duration', e.target.value)}
                  >
                    <option value="">Select duration</option>
                    <option value="less_than_1_hour">Less than 1 hour</option>
                    <option value="1_24_hours">1-24 hours</option>
                    <option value="1_7_days">1-7 days</option>
                    <option value="1_4_weeks">1-4 weeks</option>
                    <option value="more_than_1_month">More than 1 month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Severity</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    value={symptom.severity}
                    onChange={(e) => updateSymptom(index, 'severity', e.target.value)}
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

            {/* Vitals Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <Activity className="text-green-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Vital Signs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><Thermometer className="inline mr-2" size={16} />Temperature (°F)</label>
            {/* CORRECTED onChange */}
            <input type="number" step="0.1" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="98.6" value={vitals.temperature} onChange={(e) => setVitals(prev => ({ ...prev, temperature: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><Heart className="inline mr-2" size={16} />Blood Pressure</label>
            <div className="flex gap-2">
              {/* CORRECTED onChange */}
              <input type="number" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="120" value={vitals.bp_systolic} onChange={(e) => setVitals(prev => ({ ...prev, bp_systolic: e.target.value }))} />
              <span className="self-center">/</span>
              {/* CORRECTED onChange */}
              <input type="number" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="80" value={vitals.bp_diastolic} onChange={(e) => setVitals(prev => ({ ...prev, bp_diastolic: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SpO2 (%)</label>
            {/* CORRECTED onChange */}
            <input type="number" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="98" value={vitals.spo2} onChange={(e) => setVitals(prev => ({ ...prev, spo2: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
            {/* CORRECTED onChange */}
            <input type="number" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="72" value={vitals.pulse} onChange={(e) => setVitals(prev => ({ ...prev, pulse: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate</label>
            {/* CORRECTED onChange */}
            <input type="number" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="16" value={vitals.respiratory_rate} onChange={(e) => setVitals(prev => ({ ...prev, respiratory_rate: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* File Uploads */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <Upload className="text-purple-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Medical Records</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lab Reports</label>
            <input type="file" ref={labReportRef} onChange={(e) => handleFileChange(e, setLabReport)} className="hidden" accept=".pdf,.jpg,.png" />
            <div onClick={() => labReportRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
              <Upload className="mx-auto mb-2 text-gray-400" size={32} />
              {labReport ? <p className="text-sm text-green-600">{labReport.name}</p> : <p className="text-gray-600">Click to upload</p>}
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Previous Health Records</label>
            <input type="file" ref={healthRecordRef} onChange={(e) => handleFileChange(e, setHealthRecord)} className="hidden" accept=".pdf,.doc,.docx" />
            <div onClick={() => healthRecordRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
              <FileText className="mx-auto mb-2 text-gray-400" size={32} />
              {healthRecord ? <p className="text-sm text-green-600">{healthRecord.name}</p> : <p className="text-gray-600">Click to upload</p>}
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        {/* NEW: Button now calls the new onGenerateReport function */}
        <button onClick={onGenerateReport} className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
          Generate AI Diagnostic Report
        </button>
        <p className="text-sm text-gray-500 mt-2">This will save a JSON file and switch to the results tab.</p>
      </div>
    </div>
  );
};

// ... (ClinicianDashboard and AgentMonitoringPanel components remain unchanged) ...
const ClinicianDashboard = ({ patientData, vitals, symptoms, setActiveTab, finalReportData }) => {
    const calculateBMI = () => {
      if (patientData.weight && patientData.height) {
        const heightInMeters = patientData.height / 100;
        return (patientData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      }
      return 'N/A';
    };
    const primarySymptoms = symptoms.map(s => s.name).join(', ') || 'N/A';
    const longestDuration = symptoms[0]?.duration.replace(/_/g, ' ') || 'N/A';

    // 💡 USE THE AI-GENERATED DATA FROM THE PROP
    // The structure depends on what your 'doctor_analysis_node' returns.
    // Let's assume it returns a 'ranked_diagnoses' list.
    const diagnoses = finalReportData?.doctor_analysis?.ranked_diagnoses || [
        // This array now serves as a fallback if the data isn't ready yet
        { condition: 'Waiting for AI Analysis...', confidence: 0, evidence: [], urgency: 'low' }
    ];

    // You can also get other data like alerts from the report
    const criticalAlert = finalReportData?.doctor_analysis?.critical_alert;

    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        {/* ... (no changes here) ... */}

        {/* 💡 DYNAMICALLY RENDER RED FLAG ALERTS */}
        {criticalAlert && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Critical Alert: Immediate Attention Required</h3>
                <p className="text-red-700">{criticalAlert}</p>
              </div>
            </div>
          </div>
        )}

        {/* Red Flag Alerts */}
        {/*<div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">*/}
        {/*  <div className="flex items-center">*/}
        {/*    <AlertTriangle className="text-red-500 mr-3" size={24} />*/}
        {/*    <div>*/}
        {/*      <h3 className="text-lg font-semibold text-red-800">Critical Alert: Immediate Attention Required</h3>*/}
        {/*      <p className="text-red-700">Potential sepsis indicators detected. Recommend immediate evaluation and blood cultures.</p>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Diagnostic Results */}
          <div className="lg:col-span-2 space-y-6">
             {/* Risk Stratification */}
            {/*<div className="bg-white p-6 rounded-lg shadow-sm">*/}
            {/*  <div className="flex items-center mb-4"><Shield className="text-orange-500 mr-3" size={24} /><h2 className="text-xl font-semibold text-gray-800">Risk Stratification</h2></div>*/}
            {/*  <div className="flex items-center space-x-4">*/}
            {/*    <div className="flex-1">*/}
            {/*      <div className="flex justify-between text-sm font-medium text-gray-700 mb-2"><span>Overall Risk Level</span><span>HIGH</span></div>*/}
            {/*      <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-red-500 h-3 rounded-full" style={{width: '85%'}}></div></div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*  <div className="mt-4 space-y-2"><div className="flex justify-between text-sm"><span>Key Risk Drivers:</span></div><ul className="text-sm text-gray-600 space-y-1 ml-4"><li>• Elevated temperature with tachycardia</li><li>• Prolonged symptom duration</li><li>• Multiple systemic symptoms</li></ul></div>*/}
            {/*</div>*/}
            {/* Ranked Diagnoses */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4"><TrendingUp className="text-blue-500 mr-3" size={24} /><h2 className="text-xl font-semibold text-gray-800">Differential Diagnoses</h2></div>
              <div className="space-y-4">
                {diagnoses.map((diagnosis, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${ diagnosis.urgency === 'high' ? 'border-red-300 bg-red-50' : diagnosis.urgency === 'medium' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 bg-white'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">{index + 1}. {diagnosis.condition}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{diagnosis.confidence}% confidence</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${diagnosis.confidence > 80 ? 'bg-red-500' : diagnosis.confidence > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${diagnosis.confidence}%`}}></div></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600"><strong>Supporting Evidence:</strong><ul className="ml-4 mt-1">{diagnosis.evidence.map((item, i) => (<li key={i}>• {item}</li>))}</ul></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Patient Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Age:</span><span>{patientData.age || 'N/A'} years</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Gender:</span><span className="capitalize">{patientData.gender || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">BMI:</span><span>{calculateBMI()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Primary Symptoms:</span><span>{primarySymptoms}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Duration:</span><span className="capitalize">{longestDuration}</span></div>
              </div>
            </div>
            {/* Key Vitals */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Current Vitals</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><div className="flex items-center"><Thermometer size={16} className="mr-2 text-red-500" /><span>Temperature:</span></div><span className="font-medium text-red-600">{vitals.temperature || 'N/A'} °F</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center"><Heart size={16} className="mr-2 text-yellow-500" /><span>Blood Pressure:</span></div><span className="font-medium text-yellow-600">{vitals.bp_systolic || 'N/A'}/{vitals.bp_diastolic || 'N/A'}</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center"><Activity size={16} className="mr-2 text-red-500" /><span>Heart Rate:</span></div><span className="font-medium text-red-600">{vitals.pulse || 'N/A'} bpm</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center"><Activity size={16} className="mr-2 text-green-500" /><span>SpO2:</span></div><span className="font-medium text-green-600">{vitals.spo2 || 'N/A'}%</span></div>
              </div>
            </div>
            {/* Agent Monitoring Panel - Integrated */}
            <AgentMonitoringPanel />
          </div>
        </div>
         {/* Action Buttons */}
         <div className="mt-8 flex justify-center space-x-4">
           <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"><CheckCircle className="mr-2" size={16} />Approve & Continue Care</button>
           <button className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"><Clock className="mr-2" size={16} />Request Additional Tests</button>
           <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"><FileText className="mr-2" size={16} />Add Clinical Notes</button></div>
      </div>
    );
  };

  const AgentMonitoringPanel = () => {
    const agentStatuses = [
      { name: 'Data Ingestion Agent', status: 'completed', progress: 100 },
      { name: 'Symptom Analysis Agent', status: 'completed', progress: 100 },
      { name: 'Vital Signs Agent', status: 'completed', progress: 100 },
      { name: 'Lab Results Agent', status: 'processing', progress: 60 },
      { name: 'Risk Stratification Agent', status: 'waiting', progress: 0 },
      { name: 'Diagnostic Reasoning Agent', status: 'waiting', progress: 0 },
    ];

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Activity className="mr-2 text-blue-500" size={20} />
          AI Agent Processing Status
        </h3>
        <div className="space-y-3">
          {agentStatuses.map((agent, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className={`w-3 h-3 rounded-full mr-3 ${agent.status === 'completed' ? 'bg-green-500' : agent.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-700">{agent.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full transition-all duration-300 ${agent.status === 'completed' ? 'bg-green-500' : agent.status === 'processing' ? 'bg-blue-500' : 'bg-gray-300'}`} style={{width: `${agent.progress}%`}}></div></div>
                <span className="text-xs text-gray-500 w-8">{agent.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };



// --- MAIN PARENT COMPONENT (Updated for Conversation) ---

const DiagnosticSystem = () => {
  // --- State for the form data ---
  const [activeTab, setActiveTab] = useState('patient');
  const [symptoms, setSymptoms] = useState<{ name: string; duration: string; severity: string }[]>([]);
  const [vitals, setVitals] = useState({ temperature: '', bp_systolic: '', bp_diastolic: '', spo2: '', pulse: '', respiratory_rate: '' });
  const [patientData, setPatientData] = useState({ name: '', age: '', gender: '', weight: '', height: '', blood_group: '' });
  const [labReport, setLabReport] = useState<File | null>(null);
  const [healthRecord, setHealthRecord] = useState<File | null>(null);

  // --- NEW: State for managing the conversation ---
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  // This state will hold the final report data to pass to the dashboard
  const [finalReport, setFinalReport] = useState<any | null>(null);


  // --- Function to START the conversation ---
    // 2. Use FormData to handle both JSON and file uploads
    // Start conversation
const handleStartConversation = async () => {
  setIsLoading(true);

  const jsonData = {
    patient_data: {
      Name: patientData.name,
      age: parseInt(patientData.age) || 0,
      weight: parseInt(patientData.weight) || 0,
      gender: patientData.gender,
      blood_group: patientData.blood_group,
      symptoms: symptoms.map(s => s.name).join(', ') || 'No symptoms reported',
      duration: symptoms[0]?.duration.replace(/_/g, ' ') || 'N/A',
      vitals: {
        temperature: vitals.temperature,
        bp: `${vitals.bp_systolic}/${vitals.bp_diastolic}`,
        pulse: vitals.pulse,
        spo2: vitals.spo2,
      },
    },
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/diagnose/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    });

    const result = await response.json();

    setConversationId(result.conversation_id);
    if (result.pending_question) {
      setMessages([{ sender: "ai", text: result.pending_question }]);
      setIsChatOpen(true);
    } else {
      setFinalReport(result.final_analysis);
      setActiveTab("results");
    }
  } catch (err) {
    console.error("Start error:", err);
  } finally {
    setIsLoading(false);
  }
};

// Continue conversation
const handleContinueConversation = async (answer: string) => {
  if (!conversationId) return;
  setMessages(prev => [...prev, { sender: "user", text: answer }]);
  setIsLoading(true);

  try {
    const response = await fetch(`http://127.0.0.1:8000/diagnose/continue?conversation_id=${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });

    const result = await response.json();

    if (result.pending_question) {
      setMessages(prev => [...prev, { sender: "ai", text: result.pending_question }]);
    } else if (result.final_analysis) {
      setFinalReport(result.final_analysis);
      setActiveTab("results");
      setIsChatOpen(false);
    }
  } catch (err) {
    console.error("Continue error:", err);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('patient')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'patient' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Patient Input
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'results' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Diagnostic Results
            </button>
          </nav>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'patient' ? (
        <PatientInputForm
          patientData={patientData}
          setPatientData={setPatientData}
          symptoms={symptoms}
          setSymptoms={setSymptoms}
          vitals={vitals}
          setVitals={setVitals}
          labReport={labReport}
          setLabReport={setLabReport}
          healthRecord={healthRecord}
          setHealthRecord={setHealthRecord}
          onGenerateReport={handleStartConversation}
        />
      ) : (
        <ClinicianDashboard
          patientData={patientData}
          vitals={vitals}
          symptoms={symptoms}
          setActiveTab={setActiveTab}
          // You can now pass the final report data to the dashboard
          finalReportData={finalReport}
        />
      )}

      {/* Conditionally render the chat panel */}
      {isChatOpen && (
        <ChatPanel
          messages={messages}
          onSendMessage={handleContinueConversation}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default DiagnosticSystem;
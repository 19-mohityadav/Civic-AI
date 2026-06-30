import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Send, MapPin, Loader2, CheckCircle2, 
  Image as ImageIcon, Video as VideoIcon, Mic, Volume2, Play, Sparkles, AlertTriangle, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { IssueCategory, Severity, IssueStatus } from '../types';

interface ReportIssueProps {
  onReported: () => void;
  onAddIssue: (newIssue: any) => void;
  reporterName?: string;
  reporterId?: string;
}

export default function ReportIssue({ 
  onReported, 
  onAddIssue,
  reporterName = "Mohit Yadav",
  reporterId = "yadavmohit85692@gmail.com"
}: ReportIssueProps) {
  const [step, setStep] = useState(1);
  const [activeType, setActiveType] = useState<'IMAGE' | 'VIDEO' | 'AUDIO'>('IMAGE');
  
  // Media states
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [textDescription, setTextDescription] = useState<string>('');

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAcceptAttribute = () => {
    if (activeType === 'IMAGE') return 'image/*';
    if (activeType === 'VIDEO') return 'video/*';
    return 'audio/*';
  };

  const clearFile = () => {
    setFileData(null);
    setFileMimeType('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startAnalysis = async () => {
    if (!fileData && !textDescription.trim()) {
      alert("Please upload a file or write a detailed description of the issue.");
      return;
    }

    setAnalyzing(true);
    setStep(2);
    try {
      const res = await fetch('/api/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file: fileData, 
          mimeType: fileMimeType, 
          textDescription: textDescription 
        }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!analysis) return;
    setSubmitting(true);
    
    // Simulate real-time database synchronization
    await new Promise(r => setTimeout(r, 1200));

    // Construct a new Issue object incorporating analyzed metadata
    const newIssue = {
      id: Date.now().toString(),
      title: analysis.title,
      description: analysis.description,
      category: analysis.category,
      status: IssueStatus.REPORTED,
      severity: analysis.severity,
      location: { 
        lat: 37.7749 + (Math.random() - 0.5) * 0.02, 
        lng: -122.4194 + (Math.random() - 0.5) * 0.02, 
        address: 'Auto-detected near Civic Center' 
      },
      reporterId: reporterId,
      reporterName: reporterName,
      // Fallback preview URL if it is image, or standard mock pictures for video/audio
      mediaUrl: activeType === 'IMAGE' && fileData 
        ? fileData 
        : activeType === 'VIDEO' 
          ? 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=400' 
          : 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      votes: 0,
      verificationCount: 0
    };

    // Propagate up to global state to immediately reflect on both Citizen and Officer views
    onAddIssue(newIssue);

    setSubmitting(false);
    setStep(3);
    setTimeout(() => onReported(), 2200);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Report an Issue</h2>
                <p className="text-sm text-gray-400">Provide photos, videos, or audio clips to help the municipality analyze and dispatch help.</p>
              </div>

              {/* Upload Media Type Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => { setActiveType('IMAGE'); clearFile(); }}
                  className={cn(
                    "py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all",
                    activeType === 'IMAGE' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <ImageIcon size={14} />
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveType('VIDEO'); clearFile(); }}
                  className={cn(
                    "py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all",
                    activeType === 'VIDEO' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <VideoIcon size={14} />
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveType('AUDIO'); clearFile(); }}
                  className={cn(
                    "py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all",
                    activeType === 'AUDIO' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <Mic size={14} />
                  Audio
                </button>
              </div>

              {/* Upload Zone */}
              {!fileData ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl transition-all group"
                >
                  <Upload className="text-gray-300 group-hover:text-blue-500 mb-3 transition-colors" size={32} />
                  <span className="text-sm font-bold text-gray-700">Choose {activeType.toLowerCase()} file</span>
                  <span className="text-xs text-gray-400 mt-1">or drag and drop here</span>
                </button>
              ) : (
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3 relative">
                  <button 
                    onClick={clearFile}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-blue-100 shadow-sm text-blue-600">
                      {activeType === 'IMAGE' && <ImageIcon size={18} />}
                      {activeType === 'VIDEO' && <VideoIcon size={18} />}
                      {activeType === 'AUDIO' && <Mic size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">{activeType} File Attached</span>
                      <span className="text-xs font-bold text-gray-700 block truncate">{fileName || 'Attached file'}</span>
                    </div>
                  </div>

                  {/* Dynamic Previews depending on selected file */}
                  {activeType === 'IMAGE' && (
                    <img src={fileData} className="w-full h-36 object-cover rounded-xl border border-gray-100" alt="Preview" />
                  )}
                  {activeType === 'VIDEO' && (
                    <video src={fileData} controls className="w-full h-36 object-contain bg-black rounded-xl border border-gray-100" />
                  )}
                  {activeType === 'AUDIO' && (
                    <audio src={fileData} controls className="w-full mt-1" />
                  )}
                </div>
              )}

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Describe the issue (Text context)</label>
                <textarea
                  placeholder="Tell us what's happening. Include references to nearby landmarks, specific problems, or severity..."
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-2xl p-4 text-xs font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none bg-gray-50/50"
                />
              </div>

              <button
                onClick={startAnalysis}
                disabled={!fileData && !textDescription.trim()}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                Analyze Submission with AI
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept={getAcceptAttribute()}
                className="hidden"
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-900 border border-gray-100 shadow-sm flex items-center justify-center">
                {activeType === 'IMAGE' && fileData && <img src={fileData} className="w-full h-full object-cover" alt="Source" />}
                {activeType === 'VIDEO' && fileData && <video src={fileData} controls className="w-full h-full object-contain" />}
                {activeType === 'AUDIO' && fileData && (
                  <div className="text-center p-6 space-y-2">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto">
                      <Volume2 size={32} />
                    </div>
                    <audio src={fileData} controls className="w-full max-w-sm mt-3 mx-auto" />
                  </div>
                )}
                {!fileData && (
                  <div className="text-center p-6">
                    <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">No Media Attached</span>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">AI analyzing text description context...</p>
                  </div>
                )}
                {analyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
                    <Loader2 className="animate-spin mb-3 text-blue-400" size={32} />
                    <span className="text-sm font-black uppercase tracking-widest text-blue-400">AI Safety Auditor</span>
                    <span className="text-xs text-gray-300 mt-1">Analyzing compliance & categorized metadata...</span>
                  </div>
                )}
              </div>

              {analysis && (
                <div className="space-y-5">
                  {/* Validation Status Banner */}
                  {analysis.isCivicIssue ? (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm shadow-green-100">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-green-800 uppercase tracking-wider">Legitimate Civic Issue Confirmed</h4>
                        <p className="text-xs text-green-600 mt-0.5">Gemini successfully matched this with regional municipal SLA regulations.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3">
                      <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm shadow-rose-100 animate-pulse">
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider">Non-Civic Content Rejected</h4>
                        <p className="text-xs text-rose-600 mt-0.5">Submit button disabled. This submission is flagged as invalid or unrelated to city governance / municipal issues.</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Generated Title</span>
                    <h3 className="text-lg font-black text-gray-900">{analysis.title}</h3>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">AI Safety Diagnosis</span>
                    <p className="text-gray-600 text-xs font-semibold leading-relaxed">{analysis.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider mb-1">Assigned Class</span>
                      <span className="font-black text-gray-700 text-xs">{analysis.category}</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider mb-1">Urgency SLA Level</span>
                      <span className={cn(
                        "font-black text-xs px-2.5 py-1 rounded-lg uppercase inline-block",
                        analysis.severity === 'CRITICAL' ? "bg-red-500 text-white" :
                        analysis.severity === 'HIGH' ? "bg-orange-500 text-white" :
                        "bg-blue-500 text-white"
                      )}>
                        {analysis.severity}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-2xl text-xs transition-all"
                    >
                      Report Another
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !analysis.isCivicIssue}
                      className={cn(
                        "flex-[2] text-white py-4 rounded-2xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2",
                        analysis.isCivicIssue 
                          ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100 cursor-pointer" 
                          : "bg-gray-300 shadow-none cursor-not-allowed"
                      )}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Publishing Report...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Publish to Live Feeds
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="mx-auto w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-gray-900">Successfully Dispatched!</h2>
                <p className="text-sm text-gray-400">Published in real-time to the community feed & municipality console.</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl inline-block">
                <span className="text-green-700 font-black text-xs uppercase tracking-wider block">Citizen Contribution Reward</span>
                <span className="text-xl font-black text-green-800 mt-1 block">+50 Civic Karma Points</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

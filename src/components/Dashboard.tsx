import React, { useState } from 'react';
import { 
  Search, Filter, AlertCircle, CheckCircle, Clock, MapPin, 
  ChevronRight, BarChart3, Users, Award, Map as MapIcon, 
  Calendar, ThumbsUp, Sparkles, BrainCircuit, Play, Volume2,
  List, CheckCircle2, TrendingUp, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Issue, IssueStatus, Severity, IssueCategory } from '../types';
import Map from './Map';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function Dashboard({ 
  userRole = 'CITIZEN',
  issues,
  setIssues
}: { 
  userRole?: 'CITIZEN' | 'OFFICER';
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
}) {
  const [activeTab, setActiveTab] = useState<'FEED' | 'ANALYTICS' | 'PREDICTIVE' | 'REWARDS'>('FEED');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Derived selected issue to remain in sync with real-time updates
  const activeSelectedIssue = selectedIssue ? issues.find(i => i.id === selectedIssue.id) || selectedIssue : null;

  // Update issue status in Firestore (for officers)
  const handleUpdateStatus = async (issueId: string, newStatus: IssueStatus) => {
    try {
      const issueRef = doc(db, 'issues', issueId);
      await updateDoc(issueRef, { status: newStatus, updatedAt: Date.now() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${issueId}`);
    }
  };

  // Update issue severity in Firestore (for officers)
  const handleUpdateSeverity = async (issueId: string, newSeverity: Severity) => {
    try {
      const issueRef = doc(db, 'issues', issueId);
      await updateDoc(issueRef, { severity: newSeverity, updatedAt: Date.now() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${issueId}`);
    }
  };

  // Handle Community Verification Voting in Firestore
  const handleVote = async (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const issue = issues.find(i => i.id === issueId);
      if (!issue) return;

      const issueRef = doc(db, 'issues', issueId);
      const newVotes = issue.votes + 1;
      const newVerificationCount = issue.verificationCount + 1;
      const newStatus = issue.status === IssueStatus.REPORTED && newVerificationCount >= 4 
        ? IssueStatus.VERIFIED 
        : issue.status;

      await updateDoc(issueRef, { 
        votes: newVotes,
        verificationCount: newVerificationCount,
        status: newStatus,
        updatedAt: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${issueId}`);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesCategory = filterCategory === 'ALL' || issue.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || issue.status === filterStatus;
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dynamic Sub-Navigation Tabs */}
      <div className="flex border-b border-gray-100 bg-white p-1.5 rounded-2xl shadow-sm overflow-x-auto gap-2">
        <TabButton active={activeTab === 'FEED'} label="Community Feed" icon={<List size={18} />} onClick={() => setActiveTab('FEED')} />
        <TabButton active={activeTab === 'ANALYTICS'} label="Impact Dashboard" icon={<BarChart3 size={18} />} onClick={() => setActiveTab('ANALYTICS')} />
        <TabButton active={activeTab === 'PREDICTIVE'} label="Predictive Insights" icon={<BrainCircuit size={18} />} onClick={() => setActiveTab('PREDICTIVE')} />
        <TabButton active={activeTab === 'REWARDS'} label="Rewards Hub" icon={<Award size={18} />} onClick={() => setActiveTab('REWARDS')} />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'FEED' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Feed Left Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filter and Search Bar */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search community issues..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    {Object.values(IssueCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    {Object.values(IssueStatus).map(st => (
                      <option key={st} value={st}>{st.replace('_', ' ')}</option>
                    ))}
                  </select>

                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setViewMode('LIST')} 
                      className={cn("p-1.5 rounded-lg transition-all", viewMode === 'LIST' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400")}
                    >
                      <List size={16} />
                    </button>
                    <button 
                      onClick={() => setViewMode('MAP')} 
                      className={cn("p-1.5 rounded-lg transition-all", viewMode === 'MAP' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400")}
                    >
                      <MapIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Feed/List Content */}
              {viewMode === 'LIST' ? (
                <div className="space-y-4">
                  {filteredIssues.map((issue) => (
                    <motion.div
                      key={issue.id}
                      layoutId={`issue-card-${issue.id}`}
                      onClick={() => setSelectedIssue(issue)}
                      className={cn(
                        "bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group relative overflow-hidden",
                        selectedIssue?.id === issue.id && "ring-2 ring-blue-600/30"
                      )}
                    >
                      <div className="flex gap-6">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 relative">
                          <img src={issue.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className={cn(
                            "absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider shadow-sm",
                            issue.severity === Severity.CRITICAL ? "bg-red-600" :
                            issue.severity === Severity.HIGH ? "bg-orange-500" : "bg-blue-500"
                          )}>
                            {issue.severity}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                                {issue.category}
                              </span>
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                issue.status === IssueStatus.RESOLVED ? "bg-green-100 text-green-700" :
                                issue.status === IssueStatus.IN_PROGRESS ? "bg-blue-100 text-blue-700" :
                                issue.status === IssueStatus.VERIFIED ? "bg-amber-100 text-amber-700" :
                                "bg-gray-100 text-gray-700"
                              )}>
                                {issue.status.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {issue.title}
                            </h3>
                            <p className="text-gray-500 text-sm line-clamp-2 mt-1 leading-relaxed">
                              {issue.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="truncate max-w-[150px]">{issue.location.address}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={14} />
                                <span>1d ago</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleVote(issue.id, e)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-500 transition-colors text-xs font-bold"
                              >
                                <ThumbsUp size={14} />
                                <span>{issue.votes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Geospatial Issue Map</h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={12} /> Active community hotspots
                    </span>
                  </div>
                  <Map 
                    issues={filteredIssues}
                    selectedIssue={selectedIssue}
                    onSelectIssue={(issue) => setSelectedIssue(issue)}
                  />
                </div>
              )}
            </div>

            {/* Sidebar Details / Secondary feed */}
            <div className="space-y-6">
              {/* Selected Issue Real-Time Tracking Tracker */}
              <AnimatePresence mode="wait">
                {activeSelectedIssue ? (
                  <motion.div
                    key={activeSelectedIssue.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6 relative"
                  >
                    <button 
                      onClick={() => setSelectedIssue(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
                    >
                      ✕
                    </button>
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                        {activeSelectedIssue.category}
                      </span>
                      <h3 className="text-xl font-black text-gray-900 mt-2 leading-snug">{activeSelectedIssue.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin size={12} /> {activeSelectedIssue.location.address}
                      </p>
                    </div>

                    <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
                      <img src={activeSelectedIssue.mediaUrl} className="w-full h-full object-cover" />
                    </div>

                    {/* Interactive Real-Time Resolution Steps Tracker */}
                    {userRole === 'OFFICER' ? (
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                          <ShieldAlert size={16} />
                          <h4 className="font-black text-xs uppercase tracking-wider">Officer Actions</h4>
                        </div>

                        {/* Status Update Select */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Set Incident Status</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.values(IssueStatus).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateStatus(activeSelectedIssue.id, status)}
                                className={cn(
                                  "py-2 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-center",
                                  activeSelectedIssue.status === status
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                )}
                              >
                                {status.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Severity Update Select */}
                        <div className="space-y-1 pt-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Modify SLA Severity</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.values(Severity).map((sev) => (
                              <button
                                key={sev}
                                onClick={() => handleUpdateSeverity(activeSelectedIssue.id, sev)}
                                className={cn(
                                  "py-2 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-center",
                                  activeSelectedIssue.severity === sev
                                    ? "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-100"
                                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                )}
                              >
                                {sev}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Dispatch Button Mock */}
                        <button 
                          onClick={() => {
                            handleUpdateStatus(activeSelectedIssue.id, IssueStatus.IN_PROGRESS);
                          }}
                          className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 mt-4"
                        >
                          <Sparkles size={14} />
                          Dispatch Response Crew
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Resolution Progress</h4>
                        <div className="relative pl-6 space-y-6">
                          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100" />
                          
                          <TrackerStep 
                            active={true} 
                            title="Issue Reported" 
                            time="1 day ago" 
                            desc={`Reported by ${activeSelectedIssue.reporterName}. Media received and cataloged.`} 
                          />
                          <TrackerStep 
                            active={activeSelectedIssue.verificationCount >= 3} 
                            title="Community Verified" 
                            time={activeSelectedIssue.verificationCount >= 3 ? "20h ago" : "Pending"} 
                            desc={`${activeSelectedIssue.verificationCount}/3 verifications received from local citizens.`} 
                          />
                          <TrackerStep 
                            active={activeSelectedIssue.status === IssueStatus.IN_PROGRESS || activeSelectedIssue.status === IssueStatus.RESOLVED} 
                            title="Department Dispatched" 
                            time={activeSelectedIssue.status === IssueStatus.IN_PROGRESS ? "Active" : "Pending"} 
                            desc="Assigned to Municipal Roads & Maintenance Department." 
                          />
                          <TrackerStep 
                            active={activeSelectedIssue.status === IssueStatus.RESOLVED} 
                            title="Resolved & Verified" 
                            time={activeSelectedIssue.status === IssueStatus.RESOLVED ? "Completed" : "Pending"} 
                            desc="Issue resolved. Before/after image validation completed by AI." 
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl text-center border border-blue-100/30">
                    <Sparkles className="mx-auto text-blue-500 mb-4" size={32} />
                    <h3 className="font-bold text-gray-900 text-lg">Interactive Tracker</h3>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                      Select any civic issue from the community feed to view live status tracker, department routing, and community votes.
                    </p>
                  </div>
                )}
              </AnimatePresence>

              {/* Verified Issues Call-out */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle2 size={18} />
                  <span className="font-bold text-sm">Citizen Duty Quest</span>
                </div>
                <h4 className="font-bold text-gray-900 leading-snug">Verify unresolved issues nearby to earn double Karma!</h4>
                <p className="text-xs text-gray-400">Help municipal departments act faster by validating complaints with real evidence.</p>
                <button className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold text-xs hover:bg-blue-700 transition-all">
                  Show Nearest Quests
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Impact Dashboard & Analytics Screen */}
        {activeTab === 'ANALYTICS' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard icon={<AlertCircle className="text-red-500" />} label="Active Issues" value="124" subValue="+12 this week" />
              <StatCard icon={<CheckCircle className="text-green-500" />} label="Resolved" value="892" subValue="94% success rate" />
              <StatCard icon={<Users className="text-blue-500" />} label="Contributors" value="2,451" subValue="85 new today" />
              <StatCard icon={<Award className="text-orange-500" />} label="Community Karma" value="45.2K" subValue="Top 5% globally" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Issue Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Issues by Category</h3>
                  <p className="text-xs text-gray-400 mt-1">Real-time volume distributed by urban infrastructure vertical</p>
                </div>
                <div className="space-y-4">
                  <ProgressIndicator label="Roads & Potholes" value={45} max={100} color="bg-blue-600" />
                  <ProgressIndicator label="Water Leakage & Drainage" value={28} max={100} color="bg-sky-500" />
                  <ProgressIndicator label="Streetlighting & Electricity" value={18} max={100} color="bg-amber-500" />
                  <ProgressIndicator label="Sanitation & Garbage Disposal" value={35} max={100} color="bg-emerald-500" />
                  <ProgressIndicator label="Other Hazards" value={12} max={100} color="bg-rose-500" />
                </div>
              </div>

              {/* Chart 2: Resolution Times */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Average Resolution SLA</h3>
                  <p className="text-xs text-gray-400 mt-1">SLA turnaround times by department (hours)</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Roads Dept</span>
                    <span className="font-bold text-gray-900">18.5 hrs</span>
                  </div>
                  <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '45%' }} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Sanitation Dept</span>
                    <span className="font-bold text-gray-900">6.2 hrs</span>
                  </div>
                  <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '15%' }} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Electrical Dept</span>
                    <span className="font-bold text-gray-900">12.0 hrs</span>
                  </div>
                  <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '30%' }} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Water Supply Board</span>
                    <span className="font-bold text-gray-900">24.5 hrs</span>
                  </div>
                  <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Predictive Insights Screen */}
        {activeTab === 'PREDICTIVE' && (
          <motion.div
            key="predictive"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full text-blue-300 font-bold text-xs">
                  <BrainCircuit size={14} />
                  <span>Google Cloud Vertex AI</span>
                </div>
                <h2 className="text-2xl font-black">Predictive Maintenance Forecasts</h2>
                <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
                  Civic AI analyzes historic complaints, local weather data, traffic frequency, and municipal infrastructure wear-and-tear models to forecast future issues.
                </p>
              </div>
              <Sparkles className="text-yellow-400 shrink-0" size={48} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PredictiveCard
                title="Pothole Risk: High"
                area="Sector 4 (Broadway / Market St)"
                reason="Heavy local rain forecasted for July 1-3. Road resurfacing is overdue by 14 months."
                reco="Dispatch preventative seal coats to prevent road erosion."
              />
              <PredictiveCard
                title="Garbage Overflow Warning"
                area="College Area Block B"
                reason="Weekly trend indicates a 34% trash accumulation spike on Friday evenings due to student event density."
                reco="Schedule an additional Friday evening collection bin run."
              />
              <PredictiveCard
                title="SLA Breach Risk"
                area="Water Board Depot 2"
                reason="Water leak turnaround times in the area have degraded from 18 to 29 hours due to maintenance staff shortfalls."
                reco="Reallocate 2 floating teams from Sector 1."
              />
            </div>
          </motion.div>
        )}

        {/* Gamification & Rewards Hub */}
        {activeTab === 'REWARDS' && (
          <motion.div
            key="rewards"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* XP and Level Progress */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">My Community Rank</h3>
                  <p className="text-gray-400 text-sm mt-1">Level up by helping your community stay safe and clean.</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <Award className="text-blue-600" size={24} />
                  <span className="font-black text-blue-600">Level 8</span>
                </div>
              </div>

              {/* Progress gauge */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-gray-600">
                  <span>840 / 1,000 XP</span>
                  <span>160 XP to Level 9</span>
                </div>
                <div className="w-full bg-gray-50 h-4 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Unlocked Badges</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <BadgeCard label="Pothole Patrol" desc="Report 5 potholes" unlocked={true} />
                  <BadgeCard label="Street Guardian" desc="Verify 3 lighting issues" unlocked={true} />
                  <BadgeCard label="Clean Hero" desc="Clean-up drive participant" unlocked={true} />
                  <BadgeCard label="City Advocate" desc="Reach 1,000 total points" unlocked={false} />
                </div>
              </div>
            </div>

            {/* Live Leaderboard */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-gray-900">City Leaderboard</h3>
                <TrendingUp size={18} className="text-blue-600" />
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Alex Rivera', points: '2,450', avatar: 'AR', rank: 1 },
                  { name: 'Sarah Chen', points: '2,120', avatar: 'SC', rank: 2 },
                  { name: 'Marcus Bell', points: '1,980', avatar: 'MB', rank: 3 },
                  { name: 'John Citizen', points: '840', avatar: 'JC', rank: 4, self: true }
                ].map((user, i) => (
                  <div key={i} className={cn("flex items-center justify-between p-2 rounded-xl", user.self && "bg-blue-50/50 border border-blue-100")}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-400 w-4">{user.rank}</span>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                        {user.avatar}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600">{user.points} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
        active 
          ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function TrackerStep({ active, title, time, desc }: { active: boolean, title: string, time: string, desc: string }) {
  return (
    <div className="relative">
      <div className={cn(
        "absolute -left-[23px] top-1 w-4.5 h-4.5 rounded-full border-4 border-white flex items-center justify-center shadow-sm",
        active ? "bg-blue-600" : "bg-gray-200"
      )} />
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className={cn("font-bold", active ? "text-gray-900" : "text-gray-400")}>{title}</span>
          <span className="text-gray-400">{time}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function ProgressIndicator({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold text-gray-600">
        <span>{label}</span>
        <span>{value} cases</span>
      </div>
      <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function PredictiveCard({ title, area, reason, reco }: { title: string, area: string, reason: string, reco: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
        <ShieldAlert size={16} />
        <span>{title}</span>
      </div>
      <div>
        <span className="text-xs text-gray-400 block">TARGET REGION</span>
        <span className="font-bold text-gray-800 text-sm">{area}</span>
      </div>
      <div>
        <span className="text-xs text-gray-400 block">AI DETECTED RISK FACTOR</span>
        <p className="text-xs text-gray-500 leading-relaxed mt-1">{reason}</p>
      </div>
      <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">RECOMMENDED ACTION</span>
        <p className="text-xs text-gray-700 font-medium mt-1">{reco}</p>
      </div>
    </div>
  );
}

function BadgeCard({ label, desc, unlocked }: { label: string, desc: string, unlocked: boolean }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-2",
      unlocked 
        ? "bg-blue-50/30 border-blue-100 text-blue-900" 
        : "bg-gray-50/50 border-gray-100 text-gray-400 select-none opacity-60"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs shadow-sm",
        unlocked ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
      )}>
        {unlocked ? "★" : "🔒"}
      </div>
      <span className="font-bold text-xs">{label}</span>
      <span className="text-[9px] font-medium leading-normal">{desc}</span>
    </div>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        <span className="text-xs text-green-500 font-bold">{subValue}</span>
      </div>
    </div>
  );
}


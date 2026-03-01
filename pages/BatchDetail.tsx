
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Batch, ImportFile } from '../types';
import { jobService } from '../services/jobService';

const BatchDetail: React.FC<{ user: User }> = ({ user }) => {
  const { batchId } = useParams<{ batchId: string }>();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [files, setFiles] = useState<ImportFile[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!batchId) return;
      const batches = JSON.parse(localStorage.getItem(`batches_${user.uid}`) || '[]');
      const b = batches.find((b: Batch) => b.id === batchId);
      if (b) {
        setBatch(b);
        const f = JSON.parse(localStorage.getItem(`batch_files_${batchId}`) || '[]');
        setFiles(f);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [batchId, user.uid]);

  if (!batch) return <div className="p-8">Batch record not found.</div>;

  const handleRetry = () => {
    if (batchId) jobService.retryFailed(user.uid, batchId);
  };

  const handleResume = () => {
    if (batchId) jobService.resumeStalled(user.uid, batchId);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full overflow-y-auto">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <Link to="/imports" className="text-xs font-bold text-[#d4a373] hover:underline uppercase mb-2 block flex items-center">
            <i className="fa-solid fa-arrow-left mr-2"></i> Back to Imports
          </Link>
          <h1 className="text-3xl font-bold mb-1">Batch Detail</h1>
          <p className="text-xs font-bold mono text-[#9e9e9e]">ID_{batch.id.split('-')[1]}</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleResume}
            className="px-4 py-2 bg-[#2d2d2d] text-[#e0e0e0] font-bold rounded text-[10px] uppercase hover:bg-[#333] transition-colors"
          >
            Resume Stalled
          </button>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-[#d4a373] text-[#121212] font-bold rounded text-[10px] uppercase hover:bg-[#c69363] transition-colors"
          >
            Retry Failed
          </button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-12">
        <div className="p-6 bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg text-center">
          <p className="text-2xl font-bold">{batch.totalFiles}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">Total Files</p>
        </div>
        <div className="p-6 bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-400">{batch.runningFiles}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">Active</p>
        </div>
        <div className="p-6 bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg text-center">
          <p className="text-2xl font-bold text-green-500">{batch.doneFiles}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">Done</p>
        </div>
        <div className="p-6 bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg text-center">
          <p className="text-2xl font-bold text-red-500">{batch.failedFiles}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">Failed</p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#242424] border-b border-[#2d2d2d] text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">
              <th className="px-6 py-4">Filename</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Stage</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d2d2d]">
            {files.map(file => (
              <tr key={file.id} className="hover:bg-[#242424] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold">{file.fileName}</span>
                    <span className="text-[9px] text-[#9e9e9e] mono uppercase">ID_{file.id.split('-').pop()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                    file.fileType === 'pdf' ? 'border-[#d4a373] text-[#d4a373]' : 'border-slate-500 text-slate-400'
                  }`}>
                    {file.fileType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold uppercase ${
                        file.status === 'done' ? 'text-green-500' :
                        file.status === 'error' ? 'text-red-500' :
                        file.status === 'running' ? 'text-blue-400' : 'text-[#9e9e9e]'
                      }`}>
                        {file.status}
                      </span>
                      {file.status === 'running' && (
                        <div className="w-16 bg-[#2d2d2d] h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-400 h-full transition-all duration-300" 
                            style={{ width: `${file.progressPct}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    {file.errorMessage && (
                      <span className="text-[9px] text-red-500 mt-1 line-clamp-1 italic">{file.errorMessage}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold uppercase text-[#9e9e9e]">{file.stage}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {file.threadId ? (
                    <Link 
                      to={`/threads/${file.threadId}`} 
                      className="text-[#d4a373] font-bold text-[10px] uppercase hover:underline"
                    >
                      View Record
                    </Link>
                  ) : (
                    <span className="text-[#2d2d2d] text-[10px] font-bold uppercase tracking-widest">Awaiting</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchDetail;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Batch } from '../types';
import { jobService } from '../services/jobService';

const Imports: React.FC<{ user: User }> = ({ user }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Polling mock (in Firestore this would be an onSnapshot listener)
    const interval = setInterval(() => {
      const savedBatches = JSON.parse(localStorage.getItem(`batches_${user.uid}`) || '[]');
      setBatches(savedBatches);
    }, 1000);
    return () => clearInterval(interval);
  }, [user.uid]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const batchId = await jobService.createBatch(user, files);
      navigate(`/batches/${batchId}`);
    } catch (err) {
      console.error("Batch creation failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full overflow-y-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Import Station</h1>
          <p className="text-[#9e9e9e]">Batch archive indexing and OCR pipeline.</p>
        </div>
        <label className={`px-6 py-2.5 bg-[#d4a373] text-[#121212] font-bold rounded cursor-pointer hover:bg-[#c69363] transition-colors flex items-center space-x-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <i className="fa-solid fa-cloud-arrow-up"></i>
          <span>{isUploading ? 'Uploading...' : 'Batch Upload'}</span>
          <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".txt,.json,.pdf" />
        </label>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#9e9e9e] mb-4">Historical Batch Records</h2>
        {batches.length === 0 ? (
          <div className="p-12 border border-dashed border-[#2d2d2d] rounded-lg text-center text-[#9e9e9e]">
            No batch operations recorded.
          </div>
        ) : (
          batches.map(batch => (
            <Link 
              key={batch.id} 
              to={`/batches/${batch.id}`}
              className="block p-4 bg-[#1a1a1a] border border-[#2d2d2d] rounded hover:border-[#d4a373] transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold mono group-hover:text-[#d4a373]">BATCH_{batch.id.split('-')[1]}</p>
                  <p className="text-[10px] text-[#9e9e9e] uppercase font-bold">{new Date(batch.createdAt).toLocaleString()}</p>
                </div>
                <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  batch.status === 'complete' ? 'bg-green-900/30 text-green-500' : 
                  batch.status === 'running' ? 'bg-blue-900/30 text-blue-400 animate-pulse' :
                  'bg-yellow-900/30 text-yellow-500'
                }`}>
                  {batch.status}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 border-t border-[#2d2d2d] pt-4">
                <div className="text-center">
                  <p className="text-xs font-bold">{batch.totalFiles}</p>
                  <p className="text-[9px] text-[#9e9e9e] uppercase tracking-tighter">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-blue-400">{batch.runningFiles}</p>
                  <p className="text-[9px] text-[#9e9e9e] uppercase tracking-tighter">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-green-500">{batch.doneFiles}</p>
                  <p className="text-[9px] text-[#9e9e9e] uppercase tracking-tighter">Success</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-red-500">{batch.failedFiles}</p>
                  <p className="text-[9px] text-[#9e9e9e] uppercase tracking-tighter">Failed</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Imports;

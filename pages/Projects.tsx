
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Project, ProjectItem, User } from '../types';

interface ProjectsProps {
  user: User;
}

const Projects: React.FC<ProjectsProps> = ({ user }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem(`projects_${user.uid}`) || '[]');
    setProjects(savedProjects);

    if (projectId) {
      const proj = savedProjects.find((p: Project) => p.id === projectId);
      if (proj) {
        setActiveProject(proj);
        const savedItems = JSON.parse(localStorage.getItem(`project_items_${projectId}`) || '[]');
        setItems(savedItems);
      }
    } else if (savedProjects.length > 0 && !projectId) {
      // Show first project if none selected
      const first = savedProjects[0];
      setActiveProject(first);
      setItems(JSON.parse(localStorage.getItem(`project_items_${first.id}`) || '[]'));
    }
  }, [projectId, user.uid]);

  const createProject = () => {
    const name = prompt("Enter project name:");
    if (!name) return;
    
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      userId: user.uid,
      canonicalName: name,
      description: null,
      status: 'planning',
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };
    
    const updated = [...projects, newProj];
    setProjects(updated);
    localStorage.setItem(`projects_${user.uid}`, JSON.stringify(updated));
    localStorage.setItem(`project_items_${newProj.id}`, JSON.stringify([]));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
      {/* Sidebar List */}
      <div className="w-64 shrink-0 space-y-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Projects</h2>
          <button 
            onClick={createProject}
            className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"
            title="Create Project"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
        
        {projects.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No projects created yet.</p>
        ) : (
          projects.map(p => (
            <Link 
              key={p.id} 
              to={`/projects/${p.id}`}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeProject?.id === p.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p.canonicalName}
            </Link>
          ))
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        {activeProject ? (
          <>
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">{activeProject.canonicalName}</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                    {activeProject.status}
                  </span>
                </div>
                <p className="text-slate-500 text-sm">Created on {new Date(activeProject.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                {/* Actions could go here */}
              </div>
            </div>

            <div className="space-y-6">
              {['requirement', 'bug', 'todo', 'feature'].map(type => {
                const typedItems = items.filter(i => i.itemType === type);
                if (typedItems.length === 0) return null;
                
                return (
                  <div key={type}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                      <span className="mr-2">{type}s</span>
                      <span className="flex-1 border-t border-slate-100"></span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {typedItems.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              item.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-white text-slate-400'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs mb-3 line-clamp-2">{item.body}</p>
                          <div className="flex justify-between items-center mt-auto">
                            <Link to={`/threads/${item.threadId}`} className="text-[10px] font-bold text-indigo-600 hover:underline">
                              View Source Thread
                            </Link>
                            <span className="text-[10px] text-slate-400">{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {items.length === 0 && (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 text-slate-300 rounded-full mb-4">
                    <i className="fa-solid fa-list-check text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">No items in this project</h3>
                  <p className="text-slate-500 text-sm mt-2">Go to a thread and add analyzed items to this project.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <i className="fa-solid fa-diagram-project text-5xl text-slate-100 mb-6"></i>
            <h2 className="text-2xl font-bold text-slate-800">Select or Create a Project</h2>
            <p className="text-slate-500 mt-2 max-w-sm">Projects help you organize requirements, bugs, and tasks extracted from various AI chat threads.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;

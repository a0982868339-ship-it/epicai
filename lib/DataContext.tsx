'use client';

import React, { createContext, useContext, useState } from 'react';
import { Project, Character, Script, Video, Voice } from '../types';

interface DataContextType {
  projects: Project[];
  characters: Character[];
  scripts: Script[];
  videos: Video[];
  voices: Voice[];
  addProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  addCharacter: (c: Character) => void;
  deleteCharacter: (id: string) => void;
  addScript: (s: Script) => void;
  addVideo: (v: Video) => void;
  addVoice: (v: Voice) => void;
  deleteVoice: (id: string) => void;
  getProjectCharacters: (projectId: string) => Character[];
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      user_id: 'user_123',
      name: "CEO's Secret Wife",
      platform: 'TikTok',
      logline: "A hidden heiress works as a janitor.",
      status: 'producing',
      created_at: '2023-10-01',
      updated_at: '2023-10-05'
    }
  ]);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [voices, setVoices] = useState<Voice[]>([
    { id: 'v1', name: 'Rachel', provider: 'elevenlabs', gender: 'female', style: 'Soft', is_custom: false }
  ]);

  const addProject = (p: Project) => setProjects(prev => [p, ...prev]);
  const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));
  const addCharacter = (c: Character) => setCharacters(prev => [c, ...prev]);
  const deleteCharacter = (id: string) => setCharacters(prev => prev.filter(c => c.id !== id));
  const addScript = (s: Script) => setScripts(prev => [s, ...prev]);
  const addVideo = (v: Video) => setVideos(prev => [v, ...prev]);
  const addVoice = (v: Voice) => setVoices(prev => [v, ...prev]);
  const deleteVoice = (id: string) => setVoices(prev => prev.filter(v => v.id !== id));
  
  const getProjectCharacters = (projectId: string) => {
      return characters.filter(c => c.project_id === projectId || !c.project_id);
  };

  return (
    <DataContext.Provider value={{ 
        projects, characters, scripts, videos, voices,
        addProject, deleteProject, 
        addCharacter, deleteCharacter,
        addScript, addVideo,
        addVoice, deleteVoice,
        getProjectCharacters 
    }}>
      {children}
    </DataContext.Provider>
  );
};
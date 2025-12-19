"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ProjectsContext } from "@/common";
import { Project } from "@/features/projects/domain";

const ProjectsContextProvider = ({
  initialProjects,
  children,
}: {
  initialProjects?: Project[];
  children?: React.ReactNode;
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [refreshing, setRefreshing] = useState(false);
  const isLoadingRef = useRef(false);

  // Fingerprint uses urlHash for remote specs (stable), URL for others (already stable)
  const fingerprint = (list: Project[]) =>
    list.flatMap(p => p.versions.flatMap(v => v.specifications.map(s => s.urlHash ?? s.url))).sort().join();

const refreshProjects = useCallback(() => {
  if (isLoadingRef.current) return;
  isLoadingRef.current = true;
  setRefreshing(true);
  fetch("/api/refresh-projects", { method: "POST" })
    .then((res) => res.json())
    .then(({ projects: newProjects }) => {
      if (newProjects) {
        setProjects(prev => fingerprint(prev) === fingerprint(newProjects) ? prev : newProjects);
      }
    })
    .catch((error) => console.error("Failed to refresh projects", error))
    .finally(() => {
      isLoadingRef.current = false;
      setRefreshing(false);
    });
}, []); 

  // Trigger background refresh after initial mount

useEffect(() => {
  // Initial refresh
  const timeout = window.setTimeout(() => {
    refreshProjects();
  }, 0);
  const handleVisibilityChange = () => {
    if (!document.hidden) refreshProjects();
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.clearTimeout(timeout);
  };
}, [refreshProjects]); 

  return (
    <ProjectsContext.Provider value={{ projects, refreshing, refreshProjects }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export default ProjectsContextProvider;

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


  const setProjectsAndRefreshed = (value: Project[]) => {
    setProjects(value);
  };

const refreshProjects = useCallback(() => {
  if (isLoadingRef.current) return;
  isLoadingRef.current = true;
  setRefreshing(true);
  fetch("/api/refresh-projects", { method: "POST" })
    .then((res) => res.json())
    .then(({ projects }) => {
      if (projects) setProjectsAndRefreshed(projects);
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
  refreshProjects();
  const handleVisibilityChange = () => {
    if (!document.hidden) refreshProjects();
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, []); 

  return (
    <ProjectsContext.Provider value={{ projects, refreshing, refreshProjects }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export default ProjectsContextProvider;

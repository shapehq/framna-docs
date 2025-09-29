"use client";

import { useState, useEffect, useRef } from "react";
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
  const isLoadingRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  const hasProjectChanged = (value: Project[]) =>
    value.some((project, index) => {
      // Compare by project id and version (or any other key fields)
      return (
        project.id !== projects[index]?.id ||
        project.versions !== projects[index]?.versions
      );
    });

  const setProjectsAndRefreshed = (value: Project[]) => {
    setProjects(value);
  };

  // Trigger background refresh after initial mount
  useEffect(() => {
    const refreshProjects = () => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setRefreshing(true);

      fetch("/api/projects", { method: "POST" })
        .then((res) => res.json())
        .then(
          ({ projects }) =>
            projects &&
            hasProjectChanged(projects) &&
            setProjectsAndRefreshed(projects)
        )
        .catch((error) => console.error("Failed to refresh projects", error))
        .finally(() => {
          isLoadingRef.current = false;
          setRefreshing(false);
        });
    };
    // Initial refresh
    refreshProjects();

    // Refresh when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshProjects();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        refreshing,
        setProjects: setProjectsAndRefreshed,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export default ProjectsContextProvider;

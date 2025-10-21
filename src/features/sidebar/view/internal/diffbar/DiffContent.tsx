"use client";

import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useProjectSelection } from "@/features/projects/data";
import DiffHeader from "./components/DiffHeader";
import DiffList from "./components/DiffList";
import DiffDialog from "./components/DiffDialog";

interface DiffChange {
  path?: string;
  text?: string;
}

interface DiffData {
  from: string;
  to: string;
  changes: DiffChange[];
}

const DiffContent = () => {
  const { project, specification, version } = useProjectSelection();
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [data, setData] = useState<DiffData | null>(null);
  const [selectedChange, setSelectedChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      setData(null);

      let currentFromBranch = fromBranch;
      let currentToBranch = toBranch;

      if (version !== undefined) {
        currentFromBranch = version.baseRef || "";
        currentToBranch = version.id;
        setFromBranch(version.baseRef || "");
        setToBranch(version.id);
      }

    const compare = async () => {
      if (project && specification && currentFromBranch && currentToBranch) {
        setLoading(true);
        const res = await fetch(
          `/api/diff/${project.owner}/${project.name}/${specification.id}?from=${currentFromBranch}&to=${currentToBranch}`
        );
        setLoading(false);
        const result = await res.json();
        setData(result);
      }
    };
    compare();
  }, [toBranch, fromBranch, project, specification, version]);

  const changes = data?.changes || [];
  const versions = project?.versions || [];

  const closeModal = () => setSelectedChange(null);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <DiffHeader
        versions={versions}
        fromBranch={fromBranch}
        onChange={(ref) => setFromBranch(ref)}
      />

      <Box
        sx={{
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <DiffList
          changes={data ? changes : []}
          loading={loading}
          data={!!data}
          selectedChange={selectedChange}
          onClick={(i) => setSelectedChange(i)}
        />
      </Box>

      <DiffDialog
        open={selectedChange !== null}
        change={selectedChange !== null ? changes[selectedChange] : null}
        onClose={closeModal}
      />
    </Box>
  );
};

export default DiffContent;

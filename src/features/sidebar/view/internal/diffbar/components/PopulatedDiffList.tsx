"use client";

import React from "react";
import SpacedList from "@/common/ui/SpacedList";
import DiffListItem from "./DiffListItem";
import { DiffChange } from "@/features/diff/domain/DiffChange";  

const PopulatedDiffList = ({
  changes,
  selectedChange,
  onClick,
}: {
  changes: DiffChange[];
  selectedChange: number | null;
  onClick: (i: number) => void;
}) => {
  return (
    <SpacedList
      itemSpacing={0.5}
      sx={{
        "& .MuiListItem-root": { pl: 0, pr: 0 },
        "& .menu-item-highlight": { px: 1, py: 1.25 },
      }}
    >
      {changes.map((change, i) => (
        <DiffListItem
          key={change.id}
          path={change?.path}
          text={change?.text}
          selected={selectedChange === i}
          onClick={() => onClick(i)}
        />
      ))}
    </SpacedList>
  );
};

export default PopulatedDiffList;

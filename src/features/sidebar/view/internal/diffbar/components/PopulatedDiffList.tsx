"use client";

import React from "react";
import SpacedList from "@/common/ui/SpacedList";
import DiffListItem from "./DiffListItem";

const PopulatedDiffList = ({
  changes,
  selectedChange,
  onClick,
}: {
  changes: any[];
  selectedChange: number | null;
  onClick: (i: number) => void;
}) => {
  return (
    <SpacedList itemSpacing={1}>
      {changes.map((change, i) => (
        <DiffListItem
          key={i}
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

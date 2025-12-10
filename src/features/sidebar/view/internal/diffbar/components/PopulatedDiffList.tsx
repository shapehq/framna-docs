"use client"

import SpacedList from "@/common/ui/SpacedList"
import DiffListItem from "./DiffListItem"
import { DiffChange } from "@/features/diff/domain/DiffChange"

const PopulatedDiffList = ({
  changes,
  onClick,
}: {
  changes: DiffChange[]
  onClick: (change: DiffChange) => void
}) => {
  return (
    <SpacedList
      itemSpacing={0.5}
      sx={{
        "& .MuiListItem-root": { pl: 0, pr: 0 },
        "& .menu-item-highlight": { px: 1, py: 1.25 },
      }}
    >
      {changes.map((change) => (
        <DiffListItem
          key={change.id}
          path={change?.path}
          text={change?.text}
          level={change?.level}
          operation={change?.operation}
          onClick={() => onClick(change)}
        />
      ))}
    </SpacedList>
  )
}

export default PopulatedDiffList

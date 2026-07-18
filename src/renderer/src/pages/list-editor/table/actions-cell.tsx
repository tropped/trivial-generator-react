/* eslint-disable react/prop-types */

import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { ListEditorTableMeta } from "./list-editor-table";

type ArrowButtonProps = {
  rowIndex: number;
  rowAmount: number;
  direction: "up" | "down";
  moveRowFunction: (rowIndex: number) => void;
};

const ArrowButton = ({ rowIndex, rowAmount, direction, moveRowFunction }: ArrowButtonProps) => {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;

  if (direction === "up" && rowIndex === 0) {
    return null;
  }

  if (direction === "down" && rowIndex === rowAmount - 1) {
    return null;
  }

  return (
    <button
      className="text-muted-foreground hover:text-primary p-0 focus:outline-none"
      onClick={() => moveRowFunction(rowIndex)}
    >
      <Icon size={16} />
    </button>
  );
};

const ActionsCell = ({ row, table }) => {
  const tableMeta = table.options.meta as ListEditorTableMeta;

  if (!tableMeta) return;

  const rowAmount = table.getRowCount();

  return (
    <div className="flex items-center justify-between h-full">
      <div className="flex flex-col items-center space-y-1">
        <ArrowButton
          direction="up"
          rowIndex={row.index}
          moveRowFunction={tableMeta.moveRowUp}
          rowAmount={rowAmount}
        />
        <ArrowButton
          direction="down"
          rowIndex={row.index}
          moveRowFunction={tableMeta.moveRowDown}
          rowAmount={rowAmount}
        />
      </div>

      <Trash2
        className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
        onClick={() => {
          tableMeta.deleteRow(row.index);
        }}
      />
    </div>
  );
};

export default ActionsCell;

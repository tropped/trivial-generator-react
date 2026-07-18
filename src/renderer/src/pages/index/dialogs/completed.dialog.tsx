import { Button } from "@renderer/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@renderer/components/ui/Dialog";

import { Dispatch, SetStateAction, useState } from "react";
import { Step, STEPS } from "./dialog.constants";

type CompletedDialogProps = {
  outputDir: string;
  failedIds: Array<string>;
  setStep: Dispatch<SetStateAction<Step>>;
  setUnembeddableIds: Dispatch<SetStateAction<Array<string>>>;
  setFailedIds: Dispatch<SetStateAction<Array<string>>>;
};

export default function CompletedDialog({
  outputDir,
  failedIds,
  setStep,
  setUnembeddableIds,
  setFailedIds
}: CompletedDialogProps) {
  const [open, setOpen] = useState(true);

  const handleClose = (event) => {
    if (!event) {
      setStep(STEPS.CONFIRMATION);
      setOpen(false);
      setUnembeddableIds([]);
      setFailedIds([]);
    }
  };

  const trivialPath = window.api.path.join(outputDir, "trivial.html");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trivial Generated</DialogTitle>
          <DialogDescription>The trivial was generated successfully</DialogDescription>
        </DialogHeader>
        {failedIds.length > 0 && (
          <p className="text-sm text-destructive">
            {failedIds.length} song{failedIds.length > 1 ? "s" : ""} couldn't be downloaded and
            will show as unavailable in the generated trivial.
          </p>
        )}
        <Button variant="secondary" onClick={() => window.api.shell.openPath(trivialPath)}>
          Open Trivial
        </Button>
        <Button variant="secondary" onClick={() => window.api.shell.openPath(outputDir)}>
          Open Folder
        </Button>
      </DialogContent>
    </Dialog>
  );
}

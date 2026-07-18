import { ListType, Song } from "@renderer/types/list.types";
import { useState } from "react";
import { Step, STEPS } from "./dialogs/dialog.constants";

import ConfirmationDialog from "./dialogs/confirmation.dialog";
import CopyrightProgressDialog from "./dialogs/copyright.dialog";
import DownloadProgressDialog from "./dialogs/download.dialog";
import RenderingHtmlDialog from "./dialogs/rendering.dialog";
import CompletedDialog from "./dialogs/completed.dialog";

type ProgressDialogProps = {
  songs: Song[];
  author: string;
  trivialType: ListType;
  outputDir: string;
};

export default function ProgressDialog({
  songs,
  outputDir,
  author,
  trivialType
}: ProgressDialogProps) {
  const [step, setStep] = useState<Step>(STEPS.CONFIRMATION);

  const [unembeddableIds, setUnembeddableIds] = useState<Array<string>>([]);
  const [failedIds, setFailedIds] = useState<Array<string>>([]);
  const [isRandomized, toggleRandomized] = useState(false);

  const isDisabled = Boolean(!outputDir || songs.length === 0);

  if (step === STEPS.CONFIRMATION) {
    return (
      <ConfirmationDialog
        songAmount={songs.length}
        isDisabled={isDisabled}
        isRandomized={isRandomized}
        toggleRandomized={toggleRandomized}
        setStep={setStep}
      />
    );
  }

  if (step === STEPS.COPYRIGHT) {
    return (
      <CopyrightProgressDialog
        songs={songs}
        setUnembeddableIds={setUnembeddableIds}
        setStep={setStep}
      />
    );
  }

  if (step === STEPS.DOWNLOAD) {
    return (
      <DownloadProgressDialog
        unembeddableIds={unembeddableIds}
        setFailedIds={setFailedIds}
        outputDir={outputDir}
        setStep={setStep}
      />
    );
  }

  if (step === STEPS.RENDERING) {
    return (
      <RenderingHtmlDialog
        author={author}
        failedIds={failedIds}
        outputDir={outputDir}
        songs={songs}
        isRandomized={isRandomized}
        unembeddableIds={unembeddableIds}
        setStep={setStep}
        trivialType={trivialType}
      />
    );
  }

  if (step === STEPS.COMPLETED) {
    return (
      <CompletedDialog
        outputDir={outputDir}
        failedIds={failedIds}
        setFailedIds={setFailedIds}
        setStep={setStep}
        setUnembeddableIds={setUnembeddableIds}
      />
    );
  }

  return null;
}

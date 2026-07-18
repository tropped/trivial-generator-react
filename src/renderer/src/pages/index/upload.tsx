import { Button } from "@renderer/components/ui/Button";
import { Input } from "@renderer/components/ui/Input";
import { Folder, Upload, X } from "lucide-react";
import { useRef } from "react";

type UploadFileProps = {
  type: "file";
  label: string;
  button: string;
  path: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClickReset: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type UploadFolderProps = {
  type: "folder";
  label: string;
  button: string;
  path: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickReset: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

function openFolder(path: string) {
  window.api.shell.openPath(path);
}

export function UploadFile({ label, button, path, onChange, onClickReset }: UploadFileProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const fileClickTrigger = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="file-upload"
        className="block font-display text-xs uppercase tracking-wider text-muted-foreground mx-2"
      >
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <Input ref={inputRef} id="file-upload" type="file" className="hidden" onChange={onChange} />
        <Button variant="outline" onClick={fileClickTrigger} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          {button}
        </Button>

        {path && (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open in file explorer"
              onClick={() => openFolder(window.api.path.dirname(path))}
            >
              <Folder className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear file selection"
              onClick={(e) => {
                onClickReset(e);
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function UploadFolder({ label, button, path, onClickReset, onClick }: UploadFolderProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="folder-upload"
        className="block font-display text-xs uppercase tracking-wider text-muted-foreground mx-2"
      >
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <div />
        <Button id="folder-upload" variant="outline" onClick={onClick} className="w-full">
          <Folder className="mr-2 h-4 w-4" />
          {button}
        </Button>

        {path && (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open file explorer"
              onClick={() => openFolder(path)}
            >
              <Folder className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear folder selection"
              onClick={onClickReset}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

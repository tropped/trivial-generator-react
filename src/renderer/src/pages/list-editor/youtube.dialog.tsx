/* eslint-disable react/no-unescaped-entities */
import { Button } from "@renderer/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@renderer/components/ui/Dialog";
import { Input } from "@renderer/components/ui/Input";
import { Label } from "@renderer/components/ui/Label";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

type YoutubeDialogProps = {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  clearError: () => void;
};

export function YoutubeDialog({ isLoading, setIsLoading, error, clearError }: YoutubeDialogProps) {
  const [playlistId, setPlaylistId] = useState("");

  const handleImportYoutubeClick = () => {
    clearError();
    window.electron.ipcRenderer.send("youtube:import", { playlistId });
    setIsLoading(true);
    setPlaylistId("");
  };

  const loadingTrigger = (
    <Button variant="outline" disabled>
      <Loader2 className="animate-spin" />
      Importing Youtube Playlist...
    </Button>
  );

  const importTrigger = <Button variant="outline">Import Youtube Playlist</Button>;
  return (
    <div className="flex flex-col gap-1">
      <Dialog>
        <DialogTrigger asChild>{isLoading ? loadingTrigger : importTrigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import your Youtube Playlist</DialogTitle>
            <DialogDescription>
              This will import the songs from the playlist -- just paste the playlist ID in here
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Playlist ID
              </Label>
              <Input
                id="name"
                placeholder="FKJ9081KJLFJLKSNLA"
                className="col-span-3"
                value={playlistId}
                onChange={(e) => setPlaylistId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button
                type="submit"
                variant="outline"
                disabled={!playlistId}
                onClick={handleImportYoutubeClick}
              >
                Import from Youtube
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

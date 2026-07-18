import MainLogo from "./index-logo";

import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { ListFile } from "@renderer/types/list.types";
import { SongListSchema } from "@renderer/schemas/list.schemas";
import { Button } from "@renderer/components/ui/Button";

import { Card, CardContent, CardFooter } from "@renderer/components/ui/Card";
import { Edit, List } from "lucide-react";
import { UploadFile, UploadFolder } from "./upload";
import ProgressDialog from "./generation.dialog";

type MainMenuProps = {
  originalListPath?: string;
  originalOutputDir?: string;
};

const EMPTY_LIST_FILE: ListFile = {
  content: {
    author: "",
    type: "anime",
    songs: []
  },
  path: ""
};

function MainMenu() {
  const defaultState = (useLocation().state as MainMenuProps | null) || {};

  const originalListPath = defaultState.originalListPath || "";
  const originalOutputDir = defaultState.originalOutputDir || "";

  const [outputDir, setOutputDir] = useState(originalOutputDir);

  const [listFile, setListFile] = useState<ListFile>({
    path: originalListPath,
    content: { author: "", type: "anime", songs: [] }
  });

  const navigate = useNavigate();

  useEffect(() => {
    const handleOutputDirectoryEvent = (_, params) => {
      setOutputDir(params.path);
    };

    return window.electron.ipcRenderer.on("dialog:outputDirectory", handleOutputDirectoryEvent);
  }, []);

  useEffect(() => {
    if (!listFile.path) return;

    const file = window.api.fs.readFileSync(listFile.path, "utf-8").toString();

    const rawListObject = JSON.parse(file);
    const validatedData = SongListSchema.parse(rawListObject);

    setListFile((oldFile) => ({ ...oldFile, content: validatedData }));
  }, [listFile.path]);

  const handleSongFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files && event.target.files?.[0];
    if (newFile) {
      setListFile((prev) => ({ ...prev, path: window.api.getPathForFile(newFile) }));
    } else {
      setListFile({ path: "", content: { author: "", type: "anime", songs: [] } });
    }
  };

  const handleOutputDirectoryClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    window.electron.ipcRenderer.send("dialog:openDirectory");
  };

  const handleListEditorClick = (mode: "new" | "edit") => {
    navigate("/list-editor", {
      state: { originalListPath: listFile.path, originalOutputDir: outputDir, mode }
    });
  };

  const displayedListPath = window.api.path.basename(listFile.path) || "Choose input file";
  const displayedOutputDir = window.api.path.basename(outputDir) || "Choose output folder";

  return (
    <div className="dark bg-stage grid grid-cols-[10%_1fr_10%] gap-0 grid-rows-1 h-full min-h-full">
      <div />
      <div className="grid grid-cols-1 grid-rows-[150px_1fr] gap-20">
        <div className="mx-auto pt-10 flex flex-row items-center justify-center gap-6 animate-rise-in">
          <MainLogo className="h-24 w-24" />
          <h1 className="font-display text-glow-gold text-5xl uppercase tracking-wide text-primary md:text-6xl lg:text-7xl">
            Trivial Generator
          </h1>
        </div>

        <div className="h-full flex items-center justify-center p-4">
          <Card
            className="w-full max-w-md pt-4 animate-rise-in"
            style={{ animationDelay: "120ms" }}
          >
            <CardContent className="space-y-4">
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => handleListEditorClick("new")}>
                  <List className="mr-2 h-4 w-4" />
                  Create List
                </Button>
                <Button
                  variant="outline"
                  disabled={!listFile.path}
                  onClick={() => handleListEditorClick("edit")}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit List
                </Button>
              </div>

              <UploadFile
                type="file"
                label="Input File"
                button={displayedListPath}
                path={listFile.path}
                onChange={handleSongFileChange}
                onClickReset={() => setListFile(EMPTY_LIST_FILE)}
              />

              <UploadFolder
                type="folder"
                label="Output folder"
                button={displayedOutputDir}
                path={outputDir}
                onClick={handleOutputDirectoryClick}
                onClickReset={() => setOutputDir("")}
              />
            </CardContent>
            <CardFooter>
              <ProgressDialog
                outputDir={outputDir}
                songs={listFile.content.songs}
                author={listFile.content.author}
                trivialType={listFile.content.type}
              />
            </CardFooter>
          </Card>
        </div>
      </div>
      <div />
    </div>
  );
}

export default MainMenu;

import { useEffect, useRef, useState } from "react";
import { Label } from "../../components/ui/Label";
import { ListEditorTable } from "./table/list-editor-table";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useLocation, useNavigate } from "react-router-dom";
import { SongListSchema } from "@renderer/schemas/list.schemas";
import { ListType, Song, SongList } from "@renderer/types/list.types";
import { SaveAs } from "./save-as";
import { Card, CardContent } from "@renderer/components/ui/Card";
import { YoutubeDialog } from "./youtube.dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@renderer/components/ui/Select";

type ListEditorProps = {
  originalListPath?: string;
  originalOutputDir?: string;
  mode: "new" | "edit";
};

function buildDefaultRow(type: ListType): Song {
  const baseRow = {
    id: "",
    name: "",
    link: "",
    difficulty: "normal" as const
  };

  if (type === "anime") {
    return {
      ...baseRow,
      anime: "",
      oped: "Opening",
      name: "",
      band: ""
    };
  }

  if (type === "game") {
    return { ...baseRow, saga: "", game: "" };
  }

  if (type === "normie") {
    return { ...baseRow, band: "" };
  }

  throw new Error("Invalid type!");
}

function ListEditor() {
  const { originalListPath, originalOutputDir, mode } = useLocation().state as ListEditorProps;

  const navigate = useNavigate();

  const [author, setAuthor] = useState("");
  const [listType, setListType] = useState<ListType>("anime");
  const [data, setData] = useState<Song[]>([]);
  const [listPath, setListPath] = useState(mode === "edit" ? originalListPath || "" : "");

  const [isImportLoading, setIsImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const tableDivRef = useRef<HTMLTableElement>(null);

  const handleInputSaveAsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    window.electron.ipcRenderer.send("dialog:saveAs");
  };

  useEffect(() => {
    if (!listPath) return;
    const file = window.api.fs.readFileSync(listPath, "utf-8").toString();

    const rawListObject = JSON.parse(file);
    const validatedData = SongListSchema.parse(rawListObject);

    setAuthor(validatedData.author);
    setData(validatedData.songs);
    setListType(validatedData.type);
  }, []);

  useEffect(() => {
    const handleYoutubePlaylistImported = (_, params) => {
      const { listSongs, error } = params;

      setIsImportLoading(false);

      if (error) {
        setImportError(error);
        return;
      }

      setImportError(null);

      const parsedNewSongs = listSongs.map((song) => {
        const newRow = buildDefaultRow(listType);

        newRow.id = song.id;
        newRow.name = song.title;
        newRow.link = `https://youtu.be/${song.id}`;

        return newRow;
      });

      const newData = [...data, ...parsedNewSongs];

      setData(newData);
    };

    return window.electron.ipcRenderer.on(
      "youtube:import:completed",
      handleYoutubePlaylistImported
    );
  });

  useEffect(() => {
    const handleListPathChanged = (_, params) => {
      setListPath(params.path);
    };

    return window.electron.ipcRenderer.on("dialog:listTargetPath", handleListPathChanged);
  }, []);

  const handleCancelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate("/", {
      state: { originalListPath, originalOutputDir }
    });
  };

  const handleSaveAndQuitClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const songList: SongList = {
      author,
      type: listType,
      songs: data
    };

    const jsonOutput = JSON.stringify(songList, null, "\t");
    window.api.fs.writeFileSync(listPath!, jsonOutput);

    navigate("/", { state: { originalListPath: listPath, originalOutputDir } });
  };

  const handleAddRowClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setData((prevData) => {
      const newRow = buildDefaultRow(listType);
      return [...prevData, newRow];
    });

    // Scroll to the bottom after updating the data
    setTimeout(() => {
      if (tableDivRef.current) {
        tableDivRef.current.scrollTop = tableDivRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleTypeSelectChanged = (value: string) => {
    setListType(value as ListType);
  };

  const isCurrentDataValid = data.every((song) => song.id.length);
  const displayedListPath = window.api.path.basename(listPath) || "Choose output file";

  const canSave = isCurrentDataValid && listPath?.length;

  return (
    <div className="dark bg-stage container mx-0 max-w-full w-full py-10 overflow-y-auto">
      <h1 className="font-display text-glow-gold mx-auto mb-6 text-2xl uppercase tracking-wide text-primary md:text-3xl lg:text-4xl">
        List Editor
      </h1>
      <ListEditorTable
        data={data}
        setData={setData}
        tableDivRef={tableDivRef}
        className="max-h-[50vh]"
        type={listType}
      />

      <div className="mt-10 mb-5 flex flex-row justify-between">
        <Card className="w-full max-w-[50%] pt-4">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[30%,1fr] grid-flow-row gap-5">
              <Label className="font-display text-xl uppercase tracking-wide text-right w-full">
                Output File:
              </Label>
              <SaveAs button={displayedListPath} path={listPath} onClick={handleInputSaveAsClick} />

              <Label className="font-display text-xl uppercase tracking-wide text-right">
                Author:
              </Label>
              <Input
                className="w-[150px]"
                placeholder="Author..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              ></Input>

              <Label className="font-display text-xl uppercase tracking-wide text-right w-full">
                Songs:
              </Label>
              <Label className="text-xl text-start self-end text-primary">{data.length}</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-[20%] max-h-20 pt-4">
          <CardContent className="space-y-4">
            <Select onValueChange={handleTypeSelectChanged} value={listType}>
              <SelectTrigger>
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent>
                {["Anime", "Normie", "Game"].map((option) => (
                  <SelectItem key={option.toLowerCase()} value={option.toLowerCase()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="w-full max-w-[20%] max-h-20 pt-4">
          <CardContent className="space-y-4">
            <div className="w-full flex flex-row justify-center gap-6">
              <Button variant="default" onClick={handleAddRowClick}>
                Add row
              </Button>
              <YoutubeDialog
                isLoading={isImportLoading}
                setIsLoading={setIsImportLoading}
                error={importError}
                clearError={() => setImportError(null)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-row-reverse gap-5">
        <Button onClick={handleSaveAndQuitClick} disabled={!canSave}>
          Save and quit
        </Button>
        <Button variant={"secondary"} onClick={handleCancelClick}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default ListEditor;

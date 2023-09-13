import { getPreferenceValues, showToast, Toast, showHUD, ActionPanel, popToRoot, List, Action, environment } from "@raycast/api";
import { useEffect, useState } from "react";
import { promises as fs } from "fs";
import { exec } from "child_process";
import path from "path";

const STORAGE_PATH: string = path.join(environment.supportPath, "paths.json");

export default function ListPaths() {
  const [searchText, setSearchText] = useState("");
  const [paths, setPaths] = useState<Record<string, string>>({});
  const [filteredList, setFilteredList] = useState<{ alias: string; path: string }[]>([]);

  const preferences = getPreferenceValues();
  const terminalApp = preferences.defaultTerminal === "iTerm" ? "iTerm" : "Terminal";

  async function fetchPaths() {
    try {
      const rawData = await fs.readFile(STORAGE_PATH, "utf-8");
      const parsedData: Record<string, string> = JSON.parse(rawData);
      setPaths(parsedData);
      setFilteredList(Object.entries(parsedData).map(([alias, path]) => ({alias, path})));
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to load paths",
        message: `${error}`,
      });
      setPaths({});
      setFilteredList([]);
    }
  }

  useEffect(() => {
    fetchPaths();
  }, []);

  useEffect(() => {
    const filtered = Object.entries(paths).filter(([alias, path]) => 
    alias.includes(searchText) || path.includes(searchText)).map(([alias, path]) => ({alias, path}));
    setFilteredList(filtered);
  }, [searchText, paths]);

  function handleSubmit(pathValue: string) {
    // Open path location in preferred terminal
    exec(`open -a ${terminalApp} "${pathValue}"`, (error) => {
      if (error) {
        showToast({
          style: Toast.Style.Failure,
          title: `Failed to open path in ${terminalApp}`,
          message: error.message,
        });
      } else {
        showHUD("Path opened!")
      }
    });
  }

  return (
    <List
      filtering={false}
      onSearchTextChange={setSearchText}
      navigationTitle="Search Paths"
      searchBarPlaceholder="Search your paths"
    >
      {filteredList.map(({alias, path}) => (
        <List.Item
          key={alias}
          title={alias}
          subtitle={path}
          actions={
            <ActionPanel>
              <Action title="Open in terminal" onAction={() => handleSubmit(path)} />
            </ActionPanel>
          }
        />
      ))}
    </List>  
  );
}

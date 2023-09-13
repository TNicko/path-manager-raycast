import { ActionPanel, List, Action, environment } from "@raycast/api";
import { useEffect, useState } from "react";
import { promises as fs } from "fs";
import path from "path";

const STORAGE_PATH: string = path.join(environment.supportPath, "paths.json");
 
export default function ListPaths() {
  const [searchText, setSearchText] = useState("");
  const [paths, setPaths] = useState<Record<string, string>>({});
  const [filteredList, setFilteredList] = useState<{ alias: string; path: string }[]>([]);

  useEffect(() => {
    async function fetchPaths() {
      try {
        const rawData = await fs.readFile(STORAGE_PATH, "utf-8");
        const parsedData: Record<string, string> = JSON.parse(rawData);
        setPaths(parsedData);
        setFilteredList(Object.entries(parsedData).map(([alias, path]) => ({alias, path})));
      } catch (error: unknown) {
        console.error("Failed to load paths:", error)
        setPaths({});
        setFilteredList([]);
      }
    }
    fetchPaths();
  }, []);

  useEffect(() => {
    const filtered = Object.entries(paths).filter(([alias, path]) => 
    alias.includes(searchText) || path.includes(searchText)).map(([alias, path]) => ({alias, path}));
    setFilteredList(filtered);
  }, [searchText, paths]);

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
              <Action title="Select" onAction={() => console.log(`${alias} selected`)} />
            </ActionPanel>
          }
        />
      ))}
    </List>  
  );
}

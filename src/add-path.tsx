import { environment, popToRoot, showToast, Toast} from "@raycast/api";
import { promises as fs } from "fs";
import path from "path";
import PathForm from "./components/path-form";

const STORAGE_PATH: string = path.join(environment.supportPath, "paths.json");

export default function AddPath() {
  return <PathForm mode="add" onSubmit={handleSubmit} />;
} 

async function handleSubmit(pathValue: string, aliasValue: string) {
  try {
    // Load existing paths
    let existingData: Record<string, string> = {};
    try {
      const rawData = await fs.readFile(STORAGE_PATH, "utf-8");
      existingData = JSON.parse(rawData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Something went wrong",
          message: error.message,
        });
      } else {
        // Handle other unknown cases or rethrow
        throw error;
      }
    }

    // Check if alias already exists
    if (existingData[aliasValue]) {
      showToast({
        style: Toast.Style.Failure,
        title: "Alias In Use",
        message: `The alias "${aliasValue}" is already used for the path "${existingData[aliasValue]}". Please choose a different alias.`,
      });
      return;
    }

    // Save the new path and alias
    existingData[aliasValue] = pathValue;
    console.log(existingData)
    await fs.writeFile(STORAGE_PATH, JSON.stringify(existingData, null, 2));

    // Provide feedback and close Raycast window
    showToast({
      style: Toast.Style.Success,
      title: "Success",
      message: "Path has been added!"
    });
    popToRoot();

  } catch (error: unknown) {
    if (error instanceof Error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error saving data",
        message: error.message
      });
    } else {
      throw error;
    }
  }      
}


import { environment, popToRoot, Form, showToast, Toast, ActionPanel, Action } from "@raycast/api";
import { useState } from "react";
import { promises as fs } from "fs";
import path from "path";

const STORAGE_PATH: string = path.join(environment.supportPath, "paths.json");

export default function AddPath() {
  const [pathValue, setPath] = useState<string>("");
  const [aliasValue, setAlias] = useState<string>("");

  const [pathError, setPathError] = useState<string | undefined>();
  const [aliasError, setAliasError] = useState<string | undefined>();

  function dropPathErrorIfNeeded() {
    if (pathError && pathError.length > 0) {
      setPathError(undefined);
    }
  }

  function dropAliasErrorIfNeeded() {
    if (aliasError && aliasError.length > 0) {
      setAliasError(undefined);
    }
  }

  async function isDirectory(path: string): Promise<boolean> {
    try {
      const stat = await fs.stat(path);
      
      console.log(stat);
      
      return stat.isDirectory();
    } catch (error: unknown) {
      return false;
    }
  }

  async function validateForm(): Promise<boolean> {
    let isValid = true;
    
    if (pathValue.length === 0 ) {
      setPathError("Please enter a path.");
      isValid = false;
    } else if (!(await isDirectory(pathValue))) {
      showToast({
        style: Toast.Style.Failure,
        title: "Invalid Directory Path",
        message: "This path does not exist on your system."
      });
      isValid = false;
    }

    if (aliasValue.length === 0) {
      setAliasError("Please enter an alias.");
      isValid = false;
    }

    return isValid;
  }


  async function handleSubmit() {
    try {
      // Validation
      if (!(await validateForm())) {
          return;
      }

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

  return (
    <Form
      actions = {
        <ActionPanel>
          <Action.SubmitForm title="Add Path" onSubmit={handleSubmit}/>
        </ActionPanel>
      }
    >
      <Form.TextField 
        id="pathField"
        value={pathValue}
        title="Directory Path"
        placeholder = "Enter your path"
        error = {pathError}
        onChange = {(value) => {setPath(value); dropPathErrorIfNeeded();}}
      />
      <Form.TextField 
        id="aliasField"
        value={aliasValue}
        title="Alias"
        placeholder = "Enter an alias for your path"
        error = {aliasError}
        onChange = {value => {setAlias(value); dropAliasErrorIfNeeded();}}
      />
    </Form>
  );
} 



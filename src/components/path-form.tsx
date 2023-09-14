import {Form, showToast, useNavigation, Toast, ActionPanel, Action } from "@raycast/api";
import { useState } from "react";
import { promises as fs } from "fs";

interface PathFormProps {
  initialPath?: string;
  initialAlias?: string;
  mode: "add" | "edit";
  onSubmit: (path: string, alias: string, initialAlias: string) => Promise<void>;
}

export default function PathForm({ initialPath = "", initialAlias = "", mode, onSubmit }: PathFormProps) {
  const { pop } = useNavigation(); 
  const [pathValue, setPath] = useState<string>(initialPath);
  const [aliasValue, setAlias] = useState<string>(initialAlias);
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
    if (await validateForm()) {
      await onSubmit(pathValue, aliasValue, initialAlias);
      pop();
    }
  }

  return (
    <Form
      actions = {
        <ActionPanel>
          <Action.SubmitForm title={mode === "add" ? "Add Path" : "Save changes"} onSubmit={handleSubmit}/>
          <Action title="Cancel" onAction={pop} />
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
  )
}

import React, { useState, useEffect } from "react";
import { PageTitle } from "../layout/PageTitle";
import { ReleaseList } from "../releases/ReleaseList";
import { useToast } from "../../hooks/useToast";
import { ToastComponent } from "../ui/Toast";
import { Button } from "../ui/button";
import { Select } from "../ui/select";

type ComponentType = "skeleton" | "button" | "input" | "pill" | "toast";

interface ComponentOption {
  value: ComponentType;
  label: string;
}

const COMPONENT_OPTIONS: ComponentOption[] = [
  {
    value: "skeleton",
    label: "Loading Skeletons",
  },
  {
    value: "button",
    label: "Buttons",
  },
  {
    value: "input",
    label: "Form Inputs",
  },
  {
    value: "pill",
    label: "Pills",
  },
  {
    value: "toast",
    label: "Toast Notifications",
  },
];

export function ComponentLibrary() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>(
    () => {
      const params = new URLSearchParams(window.location.search);
      const component = params.get("component") as ComponentType;
      return COMPONENT_OPTIONS.some((opt) => opt.value === component)
        ? component
        : "skeleton";
    }
  );

  const { showToast } = useToast();

  const handleComponentChange = (value: ComponentType) => {
    setSelectedComponent(value);
    const params = new URLSearchParams(window.location.search);
    params.set("component", value);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  };

  const renderComponent = () => {
    switch (selectedComponent) {
      case "toast":
        return (
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Toast Notifications
              </h3>
              <p className="text-white/60 mb-6">
                Toast notifications for user feedback. Can be triggered
                programmatically or shown as static components.
              </p>

              <div>
                <h4 className="text-sm font-medium text-white mb-4">
                  Interactive Toasts
                </h4>
                <div className="space-y-4">
                  <div>
                    <Button
                      onClick={() =>
                        showToast({
                          type: "success",
                          message: "Operation completed successfully",
                        })
                      }
                    >
                      Trigger Success Toast
                    </Button>
                    <p className="mt-2 text-sm text-white/60">
                      Click to show a success toast at the top of the screen
                    </p>
                  </div>
                  <div>
                    <Button
                      onClick={() =>
                        showToast({
                          type: "error",
                          message: "Something went wrong",
                        })
                      }
                    >
                      Trigger Error Toast
                    </Button>
                    <p className="mt-2 text-sm text-white/60">
                      Click to show an error toast at the top of the screen
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-4">
                  Static Examples
                </h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm text-white/80 mb-2">
                      Success Toast
                    </h5>
                    <ToastComponent
                      message="Operation completed successfully"
                      type="success"
                      fixed={false}
                    />
                  </div>
                  <div>
                    <h5 className="text-sm text-white/80 mb-2">Error Toast</h5>
                    <ToastComponent
                      message="Something went wrong"
                      type="error"
                      fixed={false}
                    />
                  </div>
                  <div>
                    <h5 className="text-sm text-white/80 mb-2">
                      Dismissible Toast
                    </h5>
                    <ToastComponent
                      message="Click the X to dismiss"
                      type="success"
                      onClose={() => {}}
                      fixed={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "skeleton":
        return (
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Release Card Grid
              </h3>
              <p className="text-white/60 mb-6">
                Used to show a loading state for the release grid. Shows
                multiple cards with animated loading states.
              </p>
              <div className="p-6 bg-white/5 rounded-lg">
                <ReleaseList loading={true} releases={[]} />
              </div>
            </div>
          </div>
        );
      // We'll add other component cases later
      default:
        return null;
    }
  };

  return (
    <div className="bg">
      <PageTitle
        title="Component Library"
        subtitle="Preview and customize UI components"
      />

      <div className="mb-8">
        <label
          htmlFor="component-select"
          className="block text-sm font-medium text-white/60 mb-2"
        >
          Select Component
        </label>
        <Select
          id="component-select"
          value={selectedComponent}
          onChange={(e) =>
            handleComponentChange(e.target.value as ComponentType)
          }
        >
          {COMPONENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {renderComponent()}
    </div>
  );
}

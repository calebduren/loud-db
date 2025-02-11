import React from "react";
import { Modal } from "../ui/Modal";
import { ReleaseForm } from "./forms/ReleaseForm";
import { Release } from "../../types/database";
import { toast } from "sonner";

interface ReleaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (release: Release) => void;
  release?: Release;
}

export function ReleaseFormModal({
  isOpen,
  onClose,
  onSuccess,
  release,
}: ReleaseFormModalProps) {
  const handleSuccess = async (release: Release) => {
    try {
      await Promise.resolve(onSuccess?.(release));
      onClose();
    } catch (error) {
      console.error("Error in handleSuccess:", error);
      toast.error("Error saving release");
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if ("nativeEvent" in e) {
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    // Clear the form data from localStorage when closing
    localStorage.removeItem("releaseFormDraft");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={release ? "Edit release" : "Create new release"}
      className="max-w-2xl"
    >
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ReleaseForm
          release={release}
          onSuccess={handleSuccess}
          onClose={handleClose}
        />
      </div>
    </Modal>
  );
}

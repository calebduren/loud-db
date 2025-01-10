import React from 'react';
import { Modal } from '../ui/Modal';
import { ReleaseForm } from './forms/ReleaseForm';
import { Release } from '../../types/database';

interface ReleaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  release?: Release;
}

export function ReleaseFormModal({ isOpen, onClose, onSuccess, release }: ReleaseFormModalProps) {
  const handleSuccess = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onSuccess?.();
    onClose();
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={release ? 'Edit Release' : 'Create New Release'}
      className="max-w-2xl"
    >
      <div onClick={e => e.stopPropagation()}>
        <ReleaseForm
          release={release}
          onSuccess={handleSuccess}
          onClose={handleClose}
        />
      </div>
    </Modal>
  );
}
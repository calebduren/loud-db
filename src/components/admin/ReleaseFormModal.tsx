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
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={release ? 'Edit Release' : 'Create New Release'}
    >
      <ReleaseForm
        release={release}
        onSuccess={handleSuccess}
        onClose={onClose}
      />
    </Modal>
  );
}
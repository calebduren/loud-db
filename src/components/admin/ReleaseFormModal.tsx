import React from 'react';
import { Modal } from '../ui/Modal';
import { ReleaseForm } from './forms/ReleaseForm';
import { Release } from '../../types/database';

interface ReleaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (release: Release) => void;
  release?: Release;
}

export function ReleaseFormModal({ isOpen, onClose, onSuccess, release }: ReleaseFormModalProps) {
  const handleSuccess = async (release: Release) => {
    console.log('ReleaseFormModal - handleSuccess called');
    
    try {
      console.log('ReleaseFormModal - calling onSuccess');
      await Promise.resolve(onSuccess?.(release));
      console.log('ReleaseFormModal - onSuccess complete');
      console.log('ReleaseFormModal - closing modal');
      onClose();
      console.log('ReleaseFormModal - modal closed');
    } catch (error) {
      console.error('Error in handleSuccess:', error);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    console.log('ReleaseFormModal - handleClose called');
    if (e) {
      console.log('ReleaseFormModal - preventing event default');
      e.preventDefault();
      e.stopPropagation();
      // Also stop immediate propagation
      if ('nativeEvent' in e) {
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    // Clear the form data from localStorage when closing
    localStorage.removeItem('releaseFormDraft');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={release ? 'Edit Release' : 'Create New Release'}
      className="max-w-2xl"
    >
      <div 
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onSubmit={e => {
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
import React from "react";
import { Modal } from "../ui/Modal";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terms of Service"
    >
      <div className="space-y-4 text-sm">
        <p>Last updated: January 5, 2025</p>

        <h3 className="text-lg font-semibold">1. Agreement to Terms</h3>
        <p>
          By accessing or using Loud, you agree to be bound by these Terms of
          Service and all applicable laws and regulations.
        </p>

        <h3 className="text-lg font-semibold">2. User Accounts</h3>
        <p>
          When you create an account with us, you must provide accurate and
          complete information. You are responsible for:
        </p>
        <ul className="list-disc pl-6">
          <li>Maintaining the security of your account</li>
          <li>All activities that occur under your account</li>
          <li>Keeping your password secure</li>
        </ul>

        <h3 className="text-lg font-semibold">3. Content Guidelines</h3>
        <p>You agree not to upload or share content that:</p>
        <ul className="list-disc pl-6">
          <li>Infringes on intellectual property rights</li>
          <li>Contains harmful or malicious code</li>
          <li>Violates any applicable laws</li>
          <li>Contains hate speech or harassment</li>
        </ul>

        <h3 className="text-lg font-semibold">4. Music Licensing</h3>
        <p>
          All music shared through our platform must comply with copyright laws
          and licensing requirements. Users must:
        </p>
        <ul className="list-disc pl-6">
          <li>Own the rights to shared music</li>
          <li>Have proper licensing for covers or remixes</li>
          <li>Respect takedown requests from rights holders</li>
        </ul>

        <h3 className="text-lg font-semibold">5. Termination</h3>
        <p>
          We reserve the right to terminate or suspend your account for any
          reason, including:
        </p>
        <ul className="list-disc pl-6">
          <li>Violation of these terms</li>
          <li>Fraudulent or illegal activities</li>
          <li>Abusive behavior towards other users</li>
        </ul>

        <h3 className="text-lg font-semibold">6. Changes to Terms</h3>
        <p>
          We may modify these terms at any time. Continued use of the platform
          after changes constitutes acceptance of the new terms.
        </p>

        <h3 className="text-lg font-semibold">7. Contact</h3>
        <p>
          Questions about these terms? Contact us at{" "}
          <a href="mailto:legal@loud.fm" className="text-primary">
            legal@loud.fm
          </a>
        </p>
      </div>
    </Modal>
  );
};

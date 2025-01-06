import React from "react";
import { Modal } from "../ui/Modal";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal = ({
  isOpen,
  onClose,
}: PrivacyPolicyModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy"
    >
      <div className="space-y-4 text-sm">
        <p>Last updated: January 5, 2025</p>

        <h3 className="text-lg font-semibold">1. Introduction</h3>
        <p>
          Welcome to Loud. We respect your privacy and are committed to
          protecting your personal data.
        </p>

        <h3 className="text-lg font-semibold">2. Data We Collect</h3>
        <p>
          We collect information that you provide directly to us, including:
        </p>
        <ul className="list-disc pl-6">
          <li>Account information (email, username, password)</li>
          <li>Profile information (name, bio, profile picture)</li>
          <li>Music preferences and listening history</li>
          <li>Content you create or share on our platform</li>
        </ul>

        <h3 className="text-lg font-semibold">3. How We Use Your Data</h3>
        <p>We use your data to:</p>
        <ul className="list-disc pl-6">
          <li>Provide and improve our services</li>
          <li>Personalize your music recommendations</li>
          <li>Communicate with you about our services</li>
          <li>Ensure platform security and prevent abuse</li>
        </ul>

        <h3 className="text-lg font-semibold">4. Data Sharing</h3>
        <p>
          We do not sell your personal data. We may share your data with:
        </p>
        <ul className="list-disc pl-6">
          <li>Service providers who assist in our operations</li>
          <li>Other users (based on your privacy settings)</li>
          <li>Law enforcement when required by law</li>
        </ul>

        <h3 className="text-lg font-semibold">5. Your Rights</h3>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to data processing</li>
        </ul>

        <h3 className="text-lg font-semibold">6. Contact Us</h3>
        <p>
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@loud.fm" className="text-primary">
            privacy@loud.fm
          </a>
        </p>
      </div>
    </Modal>
  );
};

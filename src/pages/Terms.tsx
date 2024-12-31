import React from 'react';
import { LegalPage } from '../components/ui/legal-page';

export function Terms() {
  return (
    <LegalPage title="Terms and Conditions">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by the terms
            and provision of this agreement.
          </p>
        </section>

        <section>
          <h2>2. User Account</h2>
          <p>To use certain features of the service, you must:</p>
          <ul>
            <li>Create an account with accurate information</li>
            <li>Maintain the security of your account</li>
            <li>Promptly notify us of any unauthorized use</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </section>

        <section>
          <h2>3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Harass, abuse, or harm others</li>
            <li>Interfere with the proper functioning of the service</li>
          </ul>
        </section>

        <section>
          <h2>4. Content</h2>
          <p>
            Users are responsible for their content and must have the right to share any
            content they post.
          </p>
        </section>

        <section>
          <h2>5. Termination</h2>
          <p>
            We reserve the right to terminate or suspend access to our service immediately,
            without prior notice or liability.
          </p>
        </section>
    </LegalPage>
  );
}
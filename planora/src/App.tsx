/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from './pages/Router';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <Router />
      <Toaster position="top-center" />
    </>
  );
}

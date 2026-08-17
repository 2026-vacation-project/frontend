import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';

import { default as IndexPage } from './App';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route index element={<IndexPage />} />
        </Routes>
    </BrowserRouter>,
)

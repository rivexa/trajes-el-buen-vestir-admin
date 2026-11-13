import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BarraMovil, Sidebar } from '../components/admin/Sidebar';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-white min-h-screen overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
                <BarraMovil onOpen={() => setIsSidebarOpen(true)} />
                <div className="flex-1 overflow-y-auto bg-white">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

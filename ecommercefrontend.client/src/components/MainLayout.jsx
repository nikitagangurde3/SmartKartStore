import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from './Navbar';
import Footer from './Footer';
import ChatBot from './ChatBot';

const MainLayout = () => {
    return (
        <div className="main-layout d-flex flex-column min-vh-100">
            <NavigationBar />
            <main className="main-content flex-grow-1">
                <Outlet />
            </main>
            <Footer />
            <ChatBot />
        </div>
    );
};

export default MainLayout;
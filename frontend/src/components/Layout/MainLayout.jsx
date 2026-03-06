import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useEffect, useState } from 'react';
import wsService from '../../services/websocket.js';

const MainLayout = ({ children, pageTitle = 'Dashboard' }) => {
  const [iotData, setIotData] = useState({});

  useEffect(() => {
    // Connect to WebSocket service
    wsService.connect();

    // Subscribe to incoming data
    const unsubscribe = wsService.subscribe((data) => {
      if (data.type === 'iot_update') {
        setIotData(data.payload);
      }
    });

    return () => {
      unsubscribe();
      wsService.disconnect();
    };
  }, []);

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#F4F6F9' }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main content: offset left by collapsed sidebar width + gap */}
      <div
        className="flex-1 flex flex-col"
        style={{ paddingLeft: 'calc(72px + 24px)' }}
      >
        {/* Header */}
        <Header pageTitle={pageTitle} iotData={iotData} />

        {/* Page content: offset top by header height + gap */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingTop: 'calc(64px + 24px)', padding: 'calc(64px + 24px) 12px 24px 12px' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

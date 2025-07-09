import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar/Sidebar";
import { Header, WelcomeSection } from "../components/Header/Header";

interface User {
  id: string;
  username: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center px-4 py-12">
          <WelcomeSection />
          {/* ...rest of your content */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

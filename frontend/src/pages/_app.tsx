import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "../context/UserContext";
import { BookProvider } from "@/context/BookContext";
import { AgentsProvider } from "@/context/AgentsContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <BookProvider>
        <AgentsProvider>
          <Component {...pageProps} />
          <ToastContainer position="top-right" />
        </AgentsProvider>
      </BookProvider>
    </UserProvider>
  );
}

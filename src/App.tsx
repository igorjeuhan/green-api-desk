import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WhatsAppProvider } from "@/contexts/WhatsAppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Sessions } from "@/pages/Sessions";
import { Messages } from "@/pages/Messages";
import { BulkMessages } from "@/pages/BulkMessages";
import { Contacts } from "@/pages/Contacts";
import { Groups } from "@/pages/Groups";
import { Webhooks } from "@/pages/Webhooks";
import { Logs } from "@/pages/Logs";
import { Settings } from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WhatsAppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/bulk-messages" element={<BulkMessages />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/webhooks" element={<Webhooks />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </TooltipProvider>
    </WhatsAppProvider>
  </QueryClientProvider>
);

export default App;

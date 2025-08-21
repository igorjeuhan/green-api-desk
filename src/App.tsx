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
          <Routes>
            <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/sessions" element={<DashboardLayout><Sessions /></DashboardLayout>} />
            <Route path="/messages" element={<DashboardLayout><Messages /></DashboardLayout>} />
            <Route path="/bulk-messages" element={<DashboardLayout><BulkMessages /></DashboardLayout>} />
            <Route path="/contacts" element={<DashboardLayout><Contacts /></DashboardLayout>} />
            <Route path="/groups" element={<DashboardLayout><Groups /></DashboardLayout>} />
            <Route path="/webhooks" element={<DashboardLayout><Webhooks /></DashboardLayout>} />
            <Route path="/logs" element={<DashboardLayout><Logs /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WhatsAppProvider>
  </QueryClientProvider>
);

export default App;

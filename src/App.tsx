import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { UserProvider } from "./contexts/UserContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResumeScreening from "./pages/ResumeScreening";
import ResumeBuilder from "./pages/ResumeBuilder";
import SkillGap from "./pages/SkillGap";
import Roadmap30Day from "./pages/Roadmap30Day";
import Dashboard from "./pages/Dashboard";
import ResumesCreated from "./pages/dashboard/ResumesCreated";
import ResumesUploaded from "./pages/dashboard/ResumesUploaded";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/resume-screening" element={<ResumeScreening />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/skill-gap" element={<SkillGap />} />
              <Route path="/roadmap-30-day" element={<Roadmap30Day />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/resumes/created" element={<ResumesCreated />} />
              <Route path="/dashboard/resumes/uploaded" element={<ResumesUploaded />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

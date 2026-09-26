// MahaSkill Intelligence - Main Application Router & Entry Point
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { 
  LabourSignals, SkillIntelligence, EmergingSkills, DistrictIntelligence,
  SkillExplorer, CurriculumIntelligence, EmployerValidation, TrainerEquipment,
  PolicySimulator, TrainingPlans, ActionCenter, DataSources, DataQuality, Methodology 
} from './pages/Pages';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="labour-signals" element={<LabourSignals />} />
            <Route path="skill-intelligence" element={<SkillIntelligence />} />
            <Route path="emerging-skills" element={<EmergingSkills />} />
            <Route path="district-intelligence" element={<DistrictIntelligence />} />
            <Route path="skill-explorer" element={<SkillExplorer />} />
            <Route path="curriculum-intelligence" element={<CurriculumIntelligence />} />
            <Route path="employer-validation" element={<EmployerValidation />} />
            <Route path="trainer-equipment" element={<TrainerEquipment />} />
            <Route path="policy-simulator" element={<PolicySimulator />} />
            <Route path="training-plans" element={<TrainingPlans />} />
            <Route path="action-center" element={<ActionCenter />} />
            <Route path="data-sources" element={<DataSources />} />
            <Route path="data-quality" element={<DataQuality />} />
            <Route path="methodology" element={<Methodology />} />
            <Route path="*" element={<Overview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

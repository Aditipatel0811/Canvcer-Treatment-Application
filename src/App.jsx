import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Navbar, Sidebar } from "./components";
import { useStateContext } from "./context";
import { Home, Onboarding, Profile } from "./pages";
import MedicalRecords from "./pages/records/index";
import SingleRecordDetails from "./pages/records/single-record-details";
import ScreeningSchedule from "./pages/ScreeningSchedule";

const App = () => {
  const { user, authenticated, ready, login, currentUser, checkIfUserExists } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      if (ready && !authenticated) {
        login();
      } else if (user && user.email?.address) {
        const existingUser = await checkIfUserExists(user.email.address);
        if (existingUser) {
          navigate("/DisplayInfo"); // redirect to display page if user exists
        } else {
          navigate("/Onboarding"); // Otherwise go to onboarding
        }
      }
    };
  
    handleRedirect();
  }, [user, authenticated, ready, login, checkIfUserExists, navigate]);

  return (
    <div className="sm:-8 relative flex min-h-screen flex-row bg-[#13131a] p-4">
      <div className="relative mr-10 hidden sm:flex">
        <Sidebar />
      </div>

      <div className="mx-auto max-w-[1280px] flex-1 max-sm:w-full sm:pr-5">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route
            path="/medical-records/:id"
            element={<SingleRecordDetails />}
          />
          <Route path="/screening-schedules" element={<ScreeningSchedule />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ConfirmationModal from "./components/ConfirmationModal";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTestModal, setShowTestModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Mobile Header Component
  const MobileHeader = ({ title }: { title: string }) => (
    <div className="flex items-center space-x-3 lg:hidden mb-4">
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard setIsMobileSidebarOpen={setIsMobileSidebarOpen} />;
      case "candidates":
        return (
          <div className="h-full flex flex-col max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
            <MobileHeader title="Candidates" />
            <div className="flex-shrink-0 mb-4 lg:mb-6">
              <h2 className="hidden lg:block text-xl lg:text-2xl font-semibold text-gray-900">
                Candidates
              </h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Candidates feature coming soon...</p>
            </div>
          </div>
        );
      case "screening":
        return (
          <div className="h-full flex flex-col max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
            <MobileHeader title="Screening" />
            <div className="flex-shrink-0 mb-4 lg:mb-6">
              <h2 className="hidden lg:block text-xl lg:text-2xl font-semibold text-gray-900">
                Screening
              </h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Screening feature coming soon...</p>
            </div>
          </div>
        );
      case "modal-test":
        return (
          <div className="h-full flex flex-col max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
            <MobileHeader title="Modal Test" />
            <div className="flex-shrink-0 mb-4 lg:mb-6">
              <h2 className="hidden lg:block text-xl lg:text-2xl font-semibold text-gray-900">
                Modal Test
              </h2>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <button
                onClick={() => setShowTestModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Test Confirmation Modal
              </button>
            </div>
          </div>
        );
      case "reports":
        return (
          <div className="h-full flex flex-col max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
            <MobileHeader title="Reports" />
            <div className="flex-shrink-0 mb-4 lg:mb-6">
              <h2 className="hidden lg:block text-xl lg:text-2xl font-semibold text-gray-900">
                Reports
              </h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Reports feature coming soon...</p>
            </div>
          </div>
        );
      case "select-demo":
        return (
          <div className="h-full flex flex-col max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
            <MobileHeader title="Select Demo" />
            <div className="flex-shrink-0 mb-4 lg:mb-6">
              <h2 className="hidden lg:block text-xl lg:text-2xl font-semibold text-gray-900">
                Select Demo
              </h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">
                Select Demo feature coming soon...
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard setIsMobileSidebarOpen={setIsMobileSidebarOpen} />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop with blur */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-none"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className="relative flex flex-col w-64 bg-blue-50 bg-opacity-90 backdrop-blur-md shadow-xl h-full min-h-screen">
              <div className="flex items-center justify-between p-4 border-b border-blue-200">
                <h2 className="text-lg font-semibold text-blue-900">Menu</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-md text-blue-400 hover:text-blue-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1">
                <Sidebar
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setIsMobileSidebarOpen(false);
                  }}
                  isMobile={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <main className="flex-1 p-3 lg:p-6 h-full overflow-auto lg:overflow-hidden">
          {renderContent()}
        </main>
      </div>

      <ConfirmationModal
        isOpen={showTestModal}
        title="Delete Criteria"
        message="Are you sure you want to delete this criteria? This action cannot be undone."
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={() => {
          setShowTestModal(false);
          alert("Confirmed!");
        }}
        onCancel={() => setShowTestModal(false)}
        type="warning"
      />
    </div>
  );
}

export default App;

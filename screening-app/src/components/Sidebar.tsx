import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  SwatchIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { key: "dashboard", icon: HomeIcon, label: "Dashboard" },
  { key: "candidates", icon: UsersIcon, label: "Candidates" },
  { key: "screening", icon: ClipboardDocumentListIcon, label: "Screening" },
  { key: "reports", icon: ChartBarIcon, label: "Reports" },
  { key: "modal-test", icon: ExclamationTriangleIcon, label: "Modal Test" },
  { key: "select-demo", icon: SwatchIcon, label: "Select Demo" },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile?: boolean;
}

const Sidebar = ({
  activeTab,
  onTabChange,
  isMobile = false,
}: SidebarProps) => {
  if (isMobile) {
    return (
      <div className="flex flex-col py-4 h-full">
        {/* Navigation Items for Mobile */}
        <nav className="flex flex-col space-y-2 px-4 flex-1">
          {navigation.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors focus:outline-none ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="w-16 bg-white border-r border-gray-200 min-h-screen flex flex-col items-center py-4 space-y-6">
      {/* Logo */}
      <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
        <span className="text-indigo-600 font-bold text-lg">∞</span>
        {/* Replace this span with <img src="/logo.svg" /> if you have a real logo */}
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-col items-center space-y-6 mt-6 flex-1">
        {navigation.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`p-2 rounded-full transition-colors focus:outline-none ${
                isActive
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-400 hover:text-indigo-500 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-6 w-6" />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

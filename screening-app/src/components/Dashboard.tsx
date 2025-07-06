import { useState, useEffect } from "react";
import {
  PlusCircleIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  Bars3Icon,
  EllipsisVerticalIcon,
  XCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Ontology, OntologyFormData } from "../types/ontology";
import {
  loadOntologies,
  saveOntology,
  deleteOntology as deleteOntologyFromStorage,
  duplicateOntology,
} from "../utils/storage";
import OntologyModal from "./OntologyModal";

interface DashboardProps {
  setIsMobileSidebarOpen?: (open: boolean) => void;
}

const Dashboard = ({ setIsMobileSidebarOpen = () => {} }: DashboardProps) => {
  const [ontologies, setOntologies] = useState<Ontology[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOntology, setEditingOntology] = useState<Ontology | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalKey, setModalKey] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "card">("list"); // Default to list view
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadedOntologies = loadOntologies();
    setOntologies(loadedOntologies);
  }, []);

  const handleSaveOntology = (formData: OntologyFormData) => {
    const ontology: Ontology = {
      id: editingOntology?.id || crypto.randomUUID(),
      ...formData,
      createdOn: editingOntology?.createdOn || new Date().toISOString(),
      createdBy: "Liza Fisher",
    };

    saveOntology(ontology);
    setOntologies(loadOntologies());
    setEditingOntology(null);
    setIsModalOpen(false);
    setModalKey((prev) => prev + 1);
  };

  const handleEditOntology = (ontology: Ontology) => {
    setEditingOntology(ontology);
    setIsModalOpen(true);
  };

  const handleDuplicateOntology = (ontology: Ontology) => {
    const duplicated = duplicateOntology(ontology);
    saveOntology(duplicated);
    setOntologies(loadOntologies());
  };

  const handleDeleteOntology = (id: string) => {
    if (window.confirm("Are you sure you want to delete this ontology?")) {
      deleteOntologyFromStorage(id);
      setOntologies(loadOntologies());
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedOntologies = [...ontologies].sort((a, b) => {
    if (sortConfig === null) return 0;

    const aValue = a[sortConfig.key as keyof Ontology];
    const bValue = b[sortConfig.key as keyof Ontology];

    if (sortConfig.key === "createdOn") {
      const dateA = new Date(aValue as string).getTime();
      const dateB = new Date(bValue as string).getTime();
      return sortConfig.direction === "ascending"
        ? dateA - dateB
        : dateB - dateA;
    }

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const paginatedOntologies = sortedOntologies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(ontologies.length / itemsPerPage);

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 lg:py-4">
      {/* Mobile Header */}
      <div className="flex items-center space-x-3 lg:hidden mb-4">
        <button
          onClick={() => setIsMobileSidebarOpen && setIsMobileSidebarOpen(true)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          Candidate Screening Ontology
        </h2>
      </div>

      {/* Desktop Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-4 space-y-3 sm:space-y-0">
        <h2 className="hidden lg:block text-xl lg:text-2xl font-semibold text-gray-900">
          Candidate Screening Ontology
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setEditingOntology(null);
              setModalKey((prev) => prev + 1);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Add New
          </button>
          {/* List/Card Switch - Visible only on desktop (lg and up) */}
        </div>
      </div>
      <div className="hidden lg:flex space-x-2 flex-row-reverse">
        <div className="flex items-center gap-2 bg-[#EEF2F3] mb-2 px-2 py-1 rounded-md">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-700 hover:bg-white/70"
            }`}
          >
            <ListBulletIcon className="h-5 w-5" />
            List
          </button>

          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition ${
              viewMode === "card"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-700 hover:bg-white/70"
            }`}
          >
            <Squares2X2Icon className="h-5 w-5" />
            Card
          </button>
        </div>
      </div>
      {/* Ontologies Display */}
      <div className="bg-white rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
        {ontologies.length === 0 ? (
          <div className="text-center py-12 bg-gray-50">
            <p className="text-gray-500 text-sm">
              No ontologies created yet. Click "Add New" to create your first
              ontology.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout (always visible on mobile) */}
            <div className="block lg:hidden space-y-4">
              {paginatedOntologies.map((ontology) => (
                <div
                  key={ontology.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-medium text-gray-900 flex-1">
                      {ontology.roleType}
                    </h3>
                    <div className="flex space-x-2 ml-2">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <div>
                          <Menu.Button className="-m-2 p-2 rounded-full flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-opacity-75">
                            <span className="sr-only">Open options</span>
                            <EllipsisVerticalIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </Menu.Button>
                        </div>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleEditOntology(ontology)}
                                    className={`${
                                      active
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-700"
                                    } flex px-4 py-2 text-sm w-full text-left`}
                                  >
                                    <PencilIcon
                                      className="mr-3 h-5 w-5 text-gray-400 border border-transparent"
                                      aria-hidden="true"
                                    />
                                    Edit
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() =>
                                      handleDuplicateOntology(ontology)
                                    }
                                    className={`${
                                      active
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-700"
                                    } flex px-4 py-2 text-sm w-full text-left`}
                                  >
                                    <DocumentDuplicateIcon
                                      className="mr-3 h-5 w-5 text-gray-400 border border-transparent"
                                      aria-hidden="true"
                                    />
                                    Duplicate
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() =>
                                      handleDeleteOntology(ontology.id)
                                    }
                                    className={`${
                                      active
                                        ? "bg-gray-100 text-red-900"
                                        : "text-red-700"
                                    } flex px-4 py-2 text-sm w-full text-left`}
                                  >
                                    <XCircleIcon
                                      className="mr-3 h-5 w-5 text-red-400 border border-transparent"
                                      aria-hidden="true"
                                    />
                                    Delete
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Description:</span>{" "}
                      {ontology.description || "No description"}
                    </div>
                    <div>
                      <span className="font-medium">Created by:</span>{" "}
                      {ontology.createdBy}
                    </div>
                    <div>
                      <span className="font-medium">Created on:</span>{" "}
                      {formatDate(ontology.createdOn)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Layout (switch between list and card) */}
            <div className="hidden lg:flex lg:flex-col flex-1 overflow-hidden min-h-0">
              {viewMode === "list" ? (
                <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                          Role Type
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-4/12">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                          Created By
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-2/12"
                          onClick={() => handleSort("createdOn")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Created On</span>
                            {sortConfig?.key === "createdOn" && (
                              <span>
                                {sortConfig.direction === "ascending" ? (
                                  <BarsArrowUpIcon className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <BarsArrowDownIcon className="h-5 w-5 text-gray-500" />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-right w-1/12"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedOntologies.map((ontology) => (
                        <tr key={ontology.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-2/12">
                            {ontology.roleType}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-center w-4/12">
                            {ontology.description || "No description"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/12">
                            {ontology.createdBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/12">
                            {formatDate(ontology.createdOn)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-1/12">
                            <Menu
                              as="div"
                              className="relative inline-block text-left"
                            >
                              <div>
                                <Menu.Button className="-m-2 p-2 rounded-full flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-opacity-75">
                                  <span className="sr-only">Open options</span>
                                  <EllipsisVerticalIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </Menu.Button>
                              </div>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                  <div className="py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() =>
                                            handleEditOntology(ontology)
                                          }
                                          className={`${
                                            active
                                              ? "bg-gray-100 text-gray-900"
                                              : "text-gray-700"
                                          } flex px-4 py-2 text-sm w-full text-left`}
                                        >
                                          <PencilIcon
                                            className="mr-3 h-5 w-5 text-gray-400 border border-transparent"
                                            aria-hidden="true"
                                          />
                                          Edit
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() =>
                                            handleDuplicateOntology(ontology)
                                          }
                                          className={`${
                                            active
                                              ? "bg-gray-100 text-gray-900"
                                              : "text-gray-700"
                                          } flex px-4 py-2 text-sm w-full text-left`}
                                        >
                                          <DocumentDuplicateIcon
                                            className="mr-3 h-5 w-5 text-gray-400 border border-transparent"
                                            aria-hidden="true"
                                          />
                                          Duplicate
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() =>
                                            handleDeleteOntology(ontology.id)
                                          }
                                          className={`${
                                            active
                                              ? "bg-gray-100 text-red-900"
                                              : "text-red-700"
                                          } flex px-4 py-2 text-sm w-full text-left`}
                                        >
                                          <XCircleIcon
                                            className="mr-3 h-5 w-5 text-red-400 border border-transparent"
                                            aria-hidden="true"
                                          />
                                          Delete
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {paginatedOntologies.map((ontology) => (
                    <div
                      key={ontology.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-medium text-gray-900 flex-1">
                          {ontology.roleType}
                        </h3>
                        <div className="flex space-x-2 ml-2">
                          <Menu
                            as="div"
                            className="relative inline-block text-left"
                          >
                            <div>
                              <Menu.Button className="-m-2 p-2 rounded-full flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-opacity-75">
                                <span className="sr-only">Open options</span>
                                <EllipsisVerticalIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </Menu.Button>
                            </div>

                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() =>
                                          handleEditOntology(ontology)
                                        }
                                        className={`${
                                          active
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-700"
                                        } flex px-4 py-2 text-sm w-full text-left`}
                                      >
                                        <PencilIcon
                                          className="mr-3 h-5 w-5 text-gray-400 border border-transparent"
                                          aria-hidden="true"
                                        />
                                        Edit
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() =>
                                          handleDuplicateOntology(ontology)
                                        }
                                        className={`${
                                          active
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-700"
                                        } flex px-4 py-2 text-sm w-full text-left`}
                                      >
                                        <DocumentDuplicateIcon
                                          className="mr-3 h-5 w-5 text-gray-400 border border-transparent"
                                          aria-hidden="true"
                                        />
                                        Duplicate
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() =>
                                          handleDeleteOntology(ontology.id)
                                        }
                                        className={`${
                                          active
                                            ? "bg-gray-100 text-red-900"
                                            : "text-red-700"
                                        } flex px-4 py-2 text-sm w-full text-left`}
                                      >
                                        <XCircleIcon
                                          className="mr-3 h-5 w-5 text-red-400 border border-transparent"
                                          aria-hidden="true"
                                        />
                                        Delete
                                      </button>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Description:</span>{" "}
                          {ontology.description || "No description"}
                        </div>
                        <div>
                          <span className="font-medium">Created by:</span>{" "}
                          {ontology.createdBy}
                        </div>
                        <div>
                          <span className="font-medium">Created on:</span>{" "}
                          {formatDate(ontology.createdOn)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {ontologies.length > 0 && (
              <div className="flex-shrink-0 px-2 sm:px-4 py-3 flex items-center justify-between lg:px-0">
                <div className="flex-1 flex justify-between lg:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden lg:flex lg:items-center lg:justify-between w-full">
                  <div>
                    <p className="text-sm text-gray-500">
                      Showing{" "}
                      <span className="font-medium text-gray-700">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      -
                      <span className="font-medium text-gray-700">
                        {Math.min(
                          currentPage * itemsPerPage,
                          ontologies.length,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-gray-700">
                        {ontologies.length}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">{currentPage}</span>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <OntologyModal
        key={modalKey}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOntology(null);
        }}
        onSave={handleSaveOntology}
        initialData={
          editingOntology
            ? {
                roleType: editingOntology.roleType,
                description: editingOntology.description,
                structure: editingOntology.structure,
              }
            : undefined
        }
      />
    </div>
  );
};

export default Dashboard;

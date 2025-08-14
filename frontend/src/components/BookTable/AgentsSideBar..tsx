import React, { useMemo, useState } from "react";
import { useAgents } from "../../context/AgentsContext";
import { useBooks } from "../../context/BookContext";
import { toast } from "react-toastify";
import { FaPlay } from "react-icons/fa";

interface AgentsSideBarProps {
  open: boolean;
  bookId: string;
  onClose: () => void;
}

const AgentsSideBar: React.FC<AgentsSideBarProps> = ({ open, bookId, onClose }) => {
  const { agents, powerToggleAgent } = useAgents();
  const { startClassification } = useBooks();
  const [starting, setStarting] = useState<boolean>(false);

  const { classificationAgents, analysisAgents } = useMemo(() => {
    const classificationAgents = agents.filter(a => a.type === "classification");
    const analysisAgents = agents.filter(a => a.type === "analysis");
    return { classificationAgents, analysisAgents };
  }, [agents]);

  const handlePowerClick = async (agentId: string, currentStatus: boolean | undefined) => {
    try {
      await powerToggleAgent(agentId, !!currentStatus);
      toast.success(currentStatus === false ? "Powered on" : "Powered off");
    } catch (err) {
      toast.error("Failed to toggle power");
    }
  };

  const handleStart = async () => {
    if (!bookId) return;
    setStarting(true);
    try {
      await startClassification(bookId);
      toast.success("Classification started");
      onClose();
    } catch (e) {
      toast.error("Failed to start classification");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[360px] bg-white shadow-xl border-l border-gray-200
        transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Agents</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto h-[calc(100%-140px)] p-5 space-y-6">
          {/* Classification Agents */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Classification</div>
            {classificationAgents.length === 0 ? (
              <div className="text-xs text-gray-500">No classification agents</div>
            ) : (
              <ul className="divide-y border rounded">
                {classificationAgents.map(agent => (
                  <li key={agent._id} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{agent.agent_name}</div>
                    </div>
                    <button
                      onClick={() => handlePowerClick(agent._id, agent.status)}
                      className={agent.status === false ? "text-blue-500 hover:text-blue-700 focus:outline-none" : ""}
                      title={agent.status === false ? "Powered Off" : "Powered On"}
                    >
                      {agent.status === false ? <FaPlay /> : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ cursor: 'pointer' }}
                        >
                          <g clipPath="url(#clip0_1_10435)">
                            <path
                              d="M7.80078 1.36621V7.84164"
                              stroke="#394560"
                              strokeWidth="1.5541"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M11.9452 4.34473C12.7589 5.15876 13.3134 6.19552 13.5387 7.32426C13.7639 8.453 13.6499 9.62317 13.211 10.6872C12.7721 11.7512 12.028 12.6615 11.0724 13.3031C10.1169 13.9448 8.99275 14.2892 7.84175 14.2928C6.69076 14.2964 5.56446 13.9591 4.60492 13.3234C3.64537 12.6877 2.89553 11.7822 2.44998 10.7209C2.00442 9.65965 1.88309 8.49021 2.10129 7.36008C2.31949 6.22995 2.86745 5.18974 3.67607 4.37063"
                              stroke="#394560"
                              strokeWidth="1.5541"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_1_10435">
                              <rect
                                width="15.541"
                                height="15.541"
                                fill="white"
                                transform="translate(0.0302734 0.0712891)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Analysis Agents */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Analysis</div>
            {analysisAgents.length === 0 ? (
              <div className="text-xs text-gray-500">No analysis agents</div>
            ) : (
              <ul className="divide-y border rounded">
                {analysisAgents.map(agent => (
                  <li key={agent._id} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{agent.agent_name}</div>
                    </div>
                    <button
                      onClick={() => handlePowerClick(agent._id, agent.status)}
                      className={agent.status === false ? "text-blue-500 hover:text-blue-700 focus:outline-none" : ""}
                      title={agent.status === false ? "Powered Off" : "Powered On"}
                    >
                      {agent.status === false ? <FaPlay /> : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ cursor: 'pointer' }}
                        >
                          <g clipPath="url(#clip0_1_10435)">
                            <path
                              d="M7.80078 1.36621V7.84164"
                              stroke="#394560"
                              strokeWidth="1.5541"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M11.9452 4.34473C12.7589 5.15876 13.3134 6.19552 13.5387 7.32426C13.7639 8.453 13.6499 9.62317 13.211 10.6872C12.7721 11.7512 12.028 12.6615 11.0724 13.3031C10.1169 13.9448 8.99275 14.2892 7.84175 14.2928C6.69076 14.2964 5.56446 13.9591 4.60492 13.3234C3.64537 12.6877 2.89553 11.7822 2.44998 10.7209C2.00442 9.65965 1.88309 8.49021 2.10129 7.36008C2.31949 6.22995 2.86745 5.18974 3.67607 4.37063"
                              stroke="#394560"
                              strokeWidth="1.5541"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_1_10435">
                              <rect
                                width="15.541"
                                height="15.541"
                                fill="white"
                                transform="translate(0.0302734 0.0712891)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleStart}
            disabled={starting || !bookId}
            className="w-full px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {starting ? "Starting..." : "Start Processing"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentsSideBar;

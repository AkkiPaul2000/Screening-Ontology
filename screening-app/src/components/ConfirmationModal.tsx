import React from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "danger",
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "#FEF2F2",
          iconColor: "#DC2626",
          confirmButtonBg: "#DC2626",
          confirmButtonHoverBg: "#B91C1C",
        };
      case "warning":
        return {
          iconBg: "#FFFBEB",
          iconColor: "#D97706",
          confirmButtonBg: "#D97706",
          confirmButtonHoverBg: "#B45309",
        };
      case "info":
        return {
          iconBg: "#EFF6FF",
          iconColor: "#2563EB",
          confirmButtonBg: "#2563EB",
          confirmButtonHoverBg: "#1D4ED8",
        };
      default:
        return {
          iconBg: "#FEF2F2",
          iconColor: "#DC2626",
          confirmButtonBg: "#DC2626",
          confirmButtonHoverBg: "#B91C1C",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <>
      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
          }

          .modal-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            width: 420px;
            max-width: calc(100vw - 32px);
            min-height: 220px;
            overflow: hidden;
            position: relative;
          }

          .modal-header {
            padding: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #F3F4F6;
          }

          .header-content {
            display: flex;
            align-items: flex-start;
          }

          .icon-container {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 48px;
            width: 48px;
            border-radius: 50%;
            background-color: ${typeStyles.iconBg};
            flex-shrink: 0;
          }

          .icon {
            height: 24px;
            width: 24px;
            color: ${typeStyles.iconColor};
          }

          .content-area {
            margin-left: 16px;
            flex: 1;
            min-width: 0;
          }

          .title-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .modal-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            line-height: 1.25;
            color: #111827;
            word-wrap: break-word;
          }

          .close-button {
            margin-left: 16px;
            padding: 4px;
            background-color: transparent;
            border: none;
            cursor: pointer;
            color: #9CA3AF;
            border-radius: 4px;
            transition: color 0.2s ease;
            flex-shrink: 0;
          }

          .close-button:hover {
            color: #6B7280;
          }

          .close-icon {
            height: 20px;
            width: 20px;
          }

          .modal-message {
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-line;
            margin: 0;
            color: #6B7280;
            word-wrap: break-word;
          }

          .modal-footer {
            padding: 16px 24px;
            background-color: #F9FAFB;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .modal-button {
            width: 100%;
            padding: 10px 16px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border-radius: 6px;
            border: none;
            transition: background-color 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .confirm-button {
            color: white;
            background-color: ${typeStyles.confirmButtonBg};
          }

          .confirm-button:hover {
            background-color: ${typeStyles.confirmButtonHoverBg};
          }

          .cancel-button {
            color: #374151;
            background-color: white;
            border: 1px solid #D1D5DB;
          }

          .cancel-button:hover {
            background-color: #F9FAFB;
          }

          /* Mobile styles */
          @media (max-width: 640px) {
            .modal-container {
              width: calc(100vw - 32px);
              min-height: auto;
            }

            .modal-header {
              padding: 16px;
              padding-bottom: 12px;
            }

            .icon-container {
              height: 40px;
              width: 40px;
            }

            .icon {
              height: 20px;
              width: 20px;
            }

            .content-area {
              margin-left: 12px;
            }

            .modal-title {
              font-size: 16px;
            }

            .close-button {
              margin-left: 8px;
              padding: 2px;
            }

            .close-icon {
              height: 18px;
              width: 18px;
            }

            .modal-message {
              font-size: 13px;
            }

            .modal-footer {
              padding: 12px 16px;
              gap: 8px;
            }

            .modal-button {
              padding: 8px 12px;
              font-size: 13px;
            }
          }

          /* Desktop responsive styles */
          @media (min-width: 641px) {
            .modal-footer {
              flex-direction: row-reverse;
            }

            .modal-button {
              width: auto;
              min-width: 80px;
            }
          }

          /* Large desktop styles */
          @media (min-width: 768px) {
            .modal-container {
              width: 440px;
            }

            .modal-header {
              padding: 28px;
              padding-bottom: 20px;
            }

            .modal-footer {
              padding: 20px 28px;
            }
          }
        `}
      </style>

      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="header-content">
              <div className="icon-container">
                <ExclamationTriangleIcon className="icon" aria-hidden="true" />
              </div>
              <div className="content-area">
                <div className="title-row">
                  <h3 className="modal-title">{title}</h3>
                  <button
                    type="button"
                    className="close-button"
                    onClick={onCancel}
                  >
                    <XMarkIcon className="close-icon" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <p className="modal-message">{message}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="modal-button confirm-button"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="modal-button cancel-button"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;

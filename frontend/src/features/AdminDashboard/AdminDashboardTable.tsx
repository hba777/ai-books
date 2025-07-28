import React from "react";
import { User } from "../../context/UserContext"

interface AdminDashboardTableProps {
  users: User[];
  loading: boolean;
  onDeleteUser: (id: string) => void;
  onEditUser: (user: User) => void;
}

const AdminDashboardTable: React.FC<AdminDashboardTableProps> = ({
  users,
  loading,
  onDeleteUser,
  onEditUser,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#f9fafb]">
          <tr>
            <th className="py-3 px-6 text-left text-xs font-bold text-black uppercase tracking-wider">
              Username
            </th>
            <th className="py-3 px-6 text-left text-xs font-bold text-black uppercase tracking-wider">
              Role
            </th>
            <th className="py-3 px-6 text-center text-xs font-bold text-black uppercase tracking-wider">
              Department
            </th>
            <th className="py-3 px-6 text-center text-xs font-bold text-black uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-blue-50 transition">
              <td className="py-3 px-6 font-medium text-gray-900">
                {user.username}
              </td>
              <td className="py-3 px-6 capitalize text-gray-700">
                {user.role}
              </td>
              <td className="py-3 px-6 capitalize text-gray-700 text-center">
                {user.department}
              </td>
              <td className="py-3 px-6 text-center">
                <div className="flex items-center justify-center ">
                  <button
                    className="py-1 px-4 rounded text-sm font-semibold flex items-center cursor-pointer "
                    onClick={() => onEditUser(user)}
                    disabled={loading}
                  >
                    <span>
                      <svg
                        width="16"
                        height="17"
                        viewBox="0 0 16 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1_10202)">
                          <path
                            d="M14.1947 4.97134C14.3247 5.10134 14.4954 5.16667 14.6661 5.16667C14.8367 5.16667 15.0074 5.10134 15.1374 4.97134C15.3981 4.71067 15.3981 4.28934 15.1374 4.02867L12.4707 1.362C12.2101 1.10134 11.7887 1.10134 11.5281 1.362C11.2674 1.62267 11.2674 2.044 11.5281 2.30467L14.1947 4.97134Z"
                            fill="#394560"
                          />
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M0.861391 15.638C0.988057 15.7647 1.15806 15.8333 1.33272 15.8333C1.39139 15.8333 1.45006 15.8253 1.50806 15.81L5.17472 14.81C5.28672 14.7793 5.38872 14.72 5.47072 14.638L13.1374 6.97134C13.3981 6.71067 13.3981 6.28934 13.1374 6.02867L10.4707 3.362C10.2101 3.10134 9.78872 3.10134 9.52806 3.362L1.86139 11.0287C1.77939 11.1107 1.72006 11.2127 1.68939 11.3247L0.689391 14.9913C0.626724 15.222 0.692057 15.4687 0.861391 15.638ZM2.28272 14.2173L2.92939 11.8467L9.99939 4.776L11.7234 6.5L4.65272 13.5707L2.28272 14.2173Z"
                            fill="#394560"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_1_10202">
                            <rect
                              width="16"
                              height="16"
                              fill="white"
                              transform="translate(-0.000488281 0.5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                  </button>
                  <button
                    className="py-1 px-4 rounded text-sm font-semibold flex items-center cursor-pointer "
                    onClick={() => onDeleteUser(user.id)}
                    disabled={loading}
                  >
                    <span>
                      <svg
                        width="16"
                        height="17"
                        viewBox="0 0 16 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.6661 12.5001C6.2981 12.5001 5.99943 12.2021 5.99943 11.8334V7.83341C5.99943 7.46541 6.2981 7.16675 6.6661 7.16675C7.0341 7.16675 7.33276 7.46541 7.33276 7.83341V11.8334C7.33276 12.2021 7.0341 12.5001 6.6661 12.5001Z"
                          fill="#DC5D5D"
                        />
                        <path
                          d="M8.6661 11.8334C8.6661 12.2021 8.9641 12.5001 9.33276 12.5001C9.70143 12.5001 9.99943 12.2021 9.99943 11.8334V7.83341C9.99943 7.46541 9.70143 7.16675 9.33276 7.16675C8.9641 7.16675 8.6661 7.46541 8.6661 7.83341V11.8334Z"
                          fill="#DC5D5D"
                        />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M4.6661 3.83341V3.16675C4.6661 2.13875 5.6381 1.16675 6.6661 1.16675H9.33276C10.3608 1.16675 11.3328 2.13875 11.3328 3.16675V3.83341H13.9994C14.3681 3.83341 14.6661 4.13208 14.6661 4.50008C14.6661 4.86808 14.3681 5.16675 13.9994 5.16675H13.3328V13.8334C13.3328 14.8614 12.3608 15.8334 11.3328 15.8334H4.6661C3.6381 15.8334 2.6661 14.8614 2.6661 13.8334V5.16675H1.99943C1.63143 5.16675 1.33276 4.86808 1.33276 4.50008C1.33276 4.13208 1.63143 3.83341 1.99943 3.83341H4.6661ZM3.99943 5.16675V13.8334C3.99943 14.1321 4.36676 14.5001 4.6661 14.5001H11.3328C11.6314 14.5001 11.9994 14.1321 11.9994 13.8334V5.16675H3.99943ZM9.99943 3.16675V3.83341H5.99943V3.16675C5.99943 2.86741 6.36676 2.50008 6.6661 2.50008H9.33276C9.63143 2.50008 9.99943 2.86741 9.99943 3.16675Z"
                          fill="#DC5D5D"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 px-6 text-center text-gray-400">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboardTable;

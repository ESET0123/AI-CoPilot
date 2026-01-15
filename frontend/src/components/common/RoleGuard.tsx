// import { useAppSelector } from "../../app/hooks";

// export default function RoleGuard({ roles, children }) {
//   const userRoles = useAppSelector((s) => s.auth.roles);

//   if (!userRoles || userRoles.length === 0) {
//     return null;
//   }

//   const hasAccess = roles.some((r: string) => userRoles.includes(r));

//   return hasAccess ? children : null;
// }



////Example usage

// import RoleGuard from "../components/auth/RoleGuard";

// export default function DashboardPage() {
//   return (
//     <>
//       <h1>Dashboard</h1>

//       <RoleGuard roles={["admin"]}>
//         <AdminPanel />
//       </RoleGuard>

//       <RoleGuard roles={["viewer", "admin"]}>
//         <UserStatistics />
//       </RoleGuard>
//     </>
//   );
// }

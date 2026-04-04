export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT";

export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

//basic auth route protection
export const isAuthRoute = (pathname: string) => {
  return authRoutes.some((router: string) => router === pathname);
};

export type RouteConfig = {
  exact: string[];
  pattern: RegExp[];
};

export const commonProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/change-password"],
  pattern: [],
};

export const doctorProtectedRoutes: RouteConfig = {
  pattern: [/^\/doctor\/dashboard/], //matches any path that starts with /doctor/dashboard
  exact: [],
};

export const adminProtectedRoutes: RouteConfig = {
  pattern: [/^\/admin\/dashboard/], //matches any path that starts with /admin/dashboard
  exact: [],
};
// export const superAdminProtectedRoutes: RouteConfig = {
//   pattern: [/^\/admin\/dashboard/], //matches any path that starts with /admin/dashboard
//   exact: [],
// };

export const patientProtectedRoutes: RouteConfig = {
  //role based route protection partial matching
  pattern: [/^\/dashboard/],
  //role based exact matching
  exact: ["/payment/success"],
};

//function to match the routes

export const isRouteMatched = (pathname: string, routes: RouteConfig) => {
  //check for exact matches
  if (routes.exact.includes(pathname)) {
    return true;
  }
  return routes.pattern.some((pattern: RegExp) => pattern.test(pathname));
};

export const getRouteOwner = (
  pathname: string,
): "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT" | null | "COMMON" => {
  if (isRouteMatched(pathname, doctorProtectedRoutes)) {
    return "DOCTOR";
  }
//   if (isRouteMatched(pathname, superAdminProtectedRoutes)) {
//     return "SUPER_ADMIN";
//   }
  if (isRouteMatched(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }

  if (isRouteMatched(pathname, patientProtectedRoutes)) {
    return "PATIENT";
  }
  if (isRouteMatched(pathname, commonProtectedRoutes)) {
    return "COMMON";
  }
  return null;
};

export const getDefaultDashboardRoute = (role: UserRole) =>{
    if(role === "ADMIN" || role === "SUPER_ADMIN"){
        return "/admin/dashboard";
    }
    if(role === "DOCTOR"){
        return "/doctor/dashboard";
    }
    if(role === "PATIENT"){
        return "/dashboard";
    }
    return "/";
}


export const isValidRedirectForRole = (redirectPath: string, role: UserRole) =>{
    const unifySuperAdminAndAdmin = role === "SUPER_ADMIN" ? "ADMIN" : role;
    const routeOwner = getRouteOwner(redirectPath);
    if(routeOwner === null || routeOwner === "COMMON"){
      return true
    }

    if(routeOwner === role){
      return true
    }

    return false
}

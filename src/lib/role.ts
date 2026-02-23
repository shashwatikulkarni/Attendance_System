export function getViewableRoles(role: string): string[] {
  switch (role) {
    case "superAdmin":
      return ["superAdmin", "CXO/HR", "techManager", "employee", "intern"];
    case "CXO/HR":
      return ["techManager", "employee", "intern"];
    case "techManager":
      return ["employee", "intern"];
    case "employee":
      return ["intern"];
    default:
      return [];
  }
}

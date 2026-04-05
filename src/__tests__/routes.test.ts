import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const routeTestState = vi.hoisted(() => {
  const events: string[] = [];

  const authMiddleware = vi.fn((req: any, _res: any, next: any) => {
    events.push("auth");
    req.user = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      status: "active",
    };
    next();
  });

  const permissionMiddleware = vi.fn((permission: string) => {
    return (_req: any, _res: any, next: any) => {
      events.push(`permission:${permission}`);
      next();
    };
  });

  const auditMiddleware = vi.fn((entity: string) => {
    return (_req: any, _res: any, next: any) => {
      events.push(`audit:${entity}`);
      next();
    };
  });

  const makeHandler = (name: string, status = 200) =>
    vi.fn(async (_req: any, res: any) => {
      events.push(name);
      res.status(status).json({ route: name });
    });

  const authControllers = {
    register: makeHandler("auth.register", 201),
    login: makeHandler("auth.login", 200),
    logout: makeHandler("auth.logout", 200),
    getProfile: makeHandler("auth.getProfile", 200),
  };

  const userControllers = {
    getAllUsers: makeHandler("users.getAllUsers", 200),
    createUser: makeHandler("users.createUser", 201),
    getUserById: makeHandler("users.getUserById", 200),
    updateUser: makeHandler("users.updateUser", 200),
    deleteUser: makeHandler("users.deleteUser", 200),
    changeUserRole: makeHandler("users.changeUserRole", 200),
    changeUserStatus: makeHandler("users.changeUserStatus", 200),
  };

  const recordsControllers = {
    getRecords: makeHandler("records.getRecords", 200),
    getRecordById: makeHandler("records.getRecordById", 200),
    createRecord: makeHandler("records.createRecord", 201),
    updateRecord: makeHandler("records.updateRecord", 200),
    deleteRecord: makeHandler("records.deleteRecord", 200),
    restoreRecord: makeHandler("records.restoreRecord", 200),
  };

  const dashboardControllers = {
    getDashboardSummary: makeHandler("dashboard.getDashboardSummary", 200),
    getDashboardTotalsByCategory: makeHandler(
      "dashboard.getDashboardTotalsByCategory",
      200
    ),
    getDashboardTrends: makeHandler("dashboard.getDashboardTrends", 200),
    getRecentRecords: makeHandler("dashboard.getRecentRecords", 200),
    getTopCategories: makeHandler("dashboard.getTopCategories", 200),
  };

  const auditControllers = {
    getAuditLogs: makeHandler("audit.getAuditLogs", 200),
    getLogbyUser: makeHandler("audit.getLogbyUser", 200),
  };

  return {
    events,
    authMiddleware,
    permissionMiddleware,
    auditMiddleware,
    authControllers,
    userControllers,
    recordsControllers,
    dashboardControllers,
    auditControllers,
  };
});

vi.mock("../middlewares/auth.middleware.js", () => ({
  default: routeTestState.authMiddleware,
}));

vi.mock("../middlewares/rbac.middleware.js", () => ({
  default: routeTestState.permissionMiddleware,
}));

vi.mock("../middlewares/audit.middleware.js", () => ({
  auditMiddleware: routeTestState.auditMiddleware,
}));

vi.mock("../controllers/auth.controllers.js", () => ({
  default: routeTestState.authControllers,
}));

vi.mock("../controllers/user.controller.js", () => ({
  default: routeTestState.userControllers,
}));

vi.mock("../controllers/records.controller.js", () => ({
  default: routeTestState.recordsControllers,
}));

vi.mock("../controllers/dashboard.controller.js", () => ({
  default: routeTestState.dashboardControllers,
}));

vi.mock("../controllers/audit.controller.js", () => ({
  default: routeTestState.auditControllers,
}));

let app: any;

beforeAll(async () => {
  app = (await import("../app.js")).default;
});

beforeEach(() => {
  routeTestState.events.length = 0;
  routeTestState.authMiddleware.mockClear();
  routeTestState.permissionMiddleware.mockClear();
  routeTestState.auditMiddleware.mockClear();

  Object.values(routeTestState.authControllers).forEach((mock) =>
    mock.mockClear()
  );
  Object.values(routeTestState.userControllers).forEach((mock) =>
    mock.mockClear()
  );
  Object.values(routeTestState.recordsControllers).forEach((mock) =>
    mock.mockClear()
  );
  Object.values(routeTestState.dashboardControllers).forEach((mock) =>
    mock.mockClear()
  );
  Object.values(routeTestState.auditControllers).forEach((mock) =>
    mock.mockClear()
  );
});

type RouteCase = {
  method: "get" | "post" | "patch" | "delete";
  path: string;
  expectedStatus: number;
  expectedBodyRoute: string;
  expectedEvents: string[];
  body?: Record<string, unknown>;
  query?: Record<string, string>;
};

const routeCases: RouteCase[] = [
  {
    method: "post",
    path: "/api/v1/auth/register",
    expectedStatus: 201,
    expectedBodyRoute: "auth.register",
    expectedEvents: ["auth.register"],
  },
  {
    method: "post",
    path: "/api/v1/auth/login",
    expectedStatus: 200,
    expectedBodyRoute: "auth.login",
    expectedEvents: ["auth.login"],
  },
  {
    method: "post",
    path: "/api/v1/auth/logout",
    expectedStatus: 200,
    expectedBodyRoute: "auth.logout",
    expectedEvents: ["auth", "auth.logout"],
  },
  {
    method: "get",
    path: "/api/v1/auth/me",
    expectedStatus: 200,
    expectedBodyRoute: "auth.getProfile",
    expectedEvents: ["auth", "auth.getProfile"],
  },
  {
    method: "get",
    path: "/api/v1/users",
    expectedStatus: 200,
    expectedBodyRoute: "users.getAllUsers",
    expectedEvents: ["auth", "permission:users:manage", "users.getAllUsers"],
  },
  {
    method: "post",
    path: "/api/v1/users",
    expectedStatus: 201,
    expectedBodyRoute: "users.createUser",
    expectedEvents: ["auth", "permission:users:manage", "users.createUser"],
  },
  {
    method: "get",
    path: "/api/v1/users/507f1f77bcf86cd799439011",
    expectedStatus: 200,
    expectedBodyRoute: "users.getUserById",
    expectedEvents: ["auth", "permission:users:manage", "users.getUserById"],
  },
  {
    method: "patch",
    path: "/api/v1/users/507f1f77bcf86cd799439011",
    expectedStatus: 200,
    expectedBodyRoute: "users.updateUser",
    expectedEvents: ["auth", "permission:users:manage", "users.updateUser"],
  },
  {
    method: "delete",
    path: "/api/v1/users/507f1f77bcf86cd799439011",
    expectedStatus: 200,
    expectedBodyRoute: "users.deleteUser",
    expectedEvents: ["auth", "permission:users:manage", "users.deleteUser"],
  },
  {
    method: "patch",
    path: "/api/v1/users/507f1f77bcf86cd799439011/role",
    expectedStatus: 200,
    expectedBodyRoute: "users.changeUserRole",
    expectedEvents: ["auth", "permission:users:manage", "users.changeUserRole"],
  },
  {
    method: "patch",
    path: "/api/v1/users/507f1f77bcf86cd799439011/status",
    expectedStatus: 200,
    expectedBodyRoute: "users.changeUserStatus",
    expectedEvents: [
      "auth",
      "permission:users:manage",
      "users.changeUserStatus",
    ],
  },
  {
    method: "get",
    path: "/api/v1/records",
    query: { type: "income", category: "food", page: "1", limit: "10" },
    expectedStatus: 200,
    expectedBodyRoute: "records.getRecords",
    expectedEvents: [
      "auth",
      "permission:records:read",
      "audit:record",
      "records.getRecords",
    ],
  },
  {
    method: "post",
    path: "/api/v1/records",
    expectedStatus: 201,
    expectedBodyRoute: "records.createRecord",
    expectedEvents: [
      "auth",
      "permission:records:write",
      "audit:record",
      "records.createRecord",
    ],
  },
  {
    method: "get",
    path: "/api/v1/records/507f1f77bcf86cd799439011",
    expectedStatus: 200,
    expectedBodyRoute: "records.getRecordById",
    expectedEvents: [
      "auth",
      "permission:records:read",
      "audit:record",
      "records.getRecordById",
    ],
  },
  {
    method: "patch",
    path: "/api/v1/records/507f1f77bcf86cd799439011",
    expectedStatus: 200,
    expectedBodyRoute: "records.updateRecord",
    expectedEvents: [
      "auth",
      "permission:records:write",
      "audit:record",
      "records.updateRecord",
    ],
  },
  {
    method: "delete",
    path: "/api/v1/records/507f1f77bcf86cd799439011",
    expectedStatus: 200,
    expectedBodyRoute: "records.deleteRecord",
    expectedEvents: [
      "auth",
      "permission:records:delete",
      "audit:record",
      "records.deleteRecord",
    ],
  },
  {
    method: "patch",
    path: "/api/v1/records/507f1f77bcf86cd799439011/restore",
    expectedStatus: 200,
    expectedBodyRoute: "records.restoreRecord",
    expectedEvents: [
      "auth",
      "permission:records:delete",
      "audit:record",
      "records.restoreRecord",
    ],
  },
  {
    method: "get",
    path: "/api/v1/dashboard/summary",
    expectedStatus: 200,
    expectedBodyRoute: "dashboard.getDashboardSummary",
    expectedEvents: [
      "auth",
      "permission:dashboard:read",
      "audit:dashboard",
      "dashboard.getDashboardSummary",
    ],
  },
  {
    method: "get",
    path: "/api/v1/dashboard/by-category",
    expectedStatus: 200,
    expectedBodyRoute: "dashboard.getDashboardTotalsByCategory",
    expectedEvents: [
      "auth",
      "permission:dashboard:insights",
      "audit:dashboard",
      "dashboard.getDashboardTotalsByCategory",
    ],
  },
  {
    method: "get",
    path: "/api/v1/dashboard/trends",
    expectedStatus: 200,
    expectedBodyRoute: "dashboard.getDashboardTrends",
    expectedEvents: [
      "auth",
      "permission:dashboard:insights",
      "audit:dashboard",
      "dashboard.getDashboardTrends",
    ],
  },
  {
    method: "get",
    path: "/api/v1/dashboard/recent",
    expectedStatus: 200,
    expectedBodyRoute: "dashboard.getRecentRecords",
    expectedEvents: [
      "auth",
      "permission:dashboard:read",
      "audit:dashboard",
      "dashboard.getRecentRecords",
    ],
  },
  {
    method: "get",
    path: "/api/v1/dashboard/top-categories",
    expectedStatus: 200,
    expectedBodyRoute: "dashboard.getTopCategories",
    expectedEvents: [
      "auth",
      "permission:dashboard:insights",
      "audit:dashboard",
      "dashboard.getTopCategories",
    ],
  },
  {
    method: "get",
    path: "/api/v1/audit",
    expectedStatus: 200,
    expectedBodyRoute: "audit.getAuditLogs",
    expectedEvents: ["auth", "permission:audit:read", "audit.getAuditLogs"],
  },
  {
    method: "get",
    path: "/api/v1/audit/507f1f77bcf86cd799439011",
    expectedStatus: 200,
    expectedBodyRoute: "audit.getLogbyUser",
    expectedEvents: ["auth", "permission:audit:read", "audit.getLogbyUser"],
  },
];

async function sendRequest(routeCase: RouteCase) {
  let requestBuilder = (request(app) as any)[routeCase.method](routeCase.path);

  if (routeCase.query) {
    requestBuilder = requestBuilder.query(routeCase.query);
  }

  if (routeCase.body) {
    requestBuilder = requestBuilder.send(routeCase.body);
  }

  return requestBuilder;
}

describe("Route coverage", () => {
  it.each(routeCases)("$method $path", async (routeCase) => {
    const response = await sendRequest(routeCase);

    expect(response.status).toBe(routeCase.expectedStatus);
    expect(response.body).toEqual({ route: routeCase.expectedBodyRoute });
    expect(routeTestState.events).toEqual(routeCase.expectedEvents);
  });
});

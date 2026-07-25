import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listMyWins from "./tools/list-my-wins";
import createWin from "./tools/create-win";
import listRecentWins from "./tools/list-recent-wins";
import searchContent from "./tools/search-content";
import listMyProgress from "./tools/list-my-progress";
import markLessonComplete from "./tools/mark-lesson-complete";
import adminStats from "./tools/admin-stats";
import adminRecentSignups from "./tools/admin-recent-signups";
import adminRecentLeads from "./tools/admin-recent-leads";
import adminRecentPurchases from "./tools/admin-recent-purchases";
import adminCreateModule from "./tools/admin-create-module";
import adminUpdateModule from "./tools/admin-update-module";
import adminDeleteModule from "./tools/admin-delete-module";
import adminCreateLesson from "./tools/admin-create-lesson";
import adminUpdateLesson from "./tools/admin-update-lesson";
import adminDeleteLesson from "./tools/admin-delete-lesson";

// Direct Supabase host — the .lovable.cloud proxy publishes a different issuer
// and mcp-js will reject tokens against it. VITE_SUPABASE_PROJECT_ID is inlined
// at build time by Vite; the fallback keeps the string well-formed during the
// manifest-extract eval when the literal is not set.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "ai-income-systems-mcp",
  title: "AI Income Systems Lab",
  version: "0.1.0",
  instructions:
    "Tools for AI Income Systems Lab — read the signed-in member's profile, track lesson progress, post and read wins on the Wall of Wins, and search published blog posts, newsletter issues, and pillar guides. Admin-only tools expose platform stats, recent signups, leads, and purchases, and let admins create/update/delete course modules and lessons. All tools act as the authenticated user; admin tools require the admin role.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getMyProfile,
    listMyWins,
    createWin,
    listRecentWins,
    searchContent,
    listMyProgress,
    markLessonComplete,
    adminStats,
    adminRecentSignups,
    adminRecentLeads,
    adminRecentPurchases,
    adminCreateModule,
    adminUpdateModule,
    adminDeleteModule,
    adminCreateLesson,
    adminUpdateLesson,
    adminDeleteLesson,
  ],
});

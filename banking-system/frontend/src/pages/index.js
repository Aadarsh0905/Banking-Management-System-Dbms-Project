// Individual page files re-exported for clean imports
// These allow components to import from the pages directory directly

// ── Auth Pages ─────────────────────────────────────────────
export { LoginPage, RegisterPage, ForgotPasswordPage } from './AuthPages';

// ── Main Pages ─────────────────────────────────────────────
export { DashboardPage, AccountsPage, TransferPage } from './MainPages';

// ── Feature Pages ──────────────────────────────────────────
export { TransactionsPage, LoansPage, CardsPage, UpiPage } from './FeaturePages';

// ── User Pages ─────────────────────────────────────────────
export { ProfilePage, KycPage, BeneficiariesPage, NotificationsPage } from './UserPages';

// ── AI Pages ───────────────────────────────────────────────
export { SpendingInsightsPage, FraudDetectionPage } from './AiPages';
export { default as AiChatbotPage } from './AiChatbotPage';

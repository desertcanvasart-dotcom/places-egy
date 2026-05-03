import { Switch, Route, useLocation } from "wouter";
import { useEffect, useLayoutEffect, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { organizationSchema, websiteSchema } from "@/lib/schema";

// Eager imports — Home loads on first paint, NotFound is imported as a
// component by faqs-section + locations/detail (React.lazy can't be used
// when the result is rendered as <NotFound /> instead of routed).
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// All other pages are code-split — each becomes its own chunk loaded on demand.
const ListingsPage = lazy(() => import("@/pages/listings"));
const ListingDetailPage = lazy(() => import("@/pages/listings/detail"));
const GlossaryPage = lazy(() => import("@/pages/resources/glossary"));
const FAQIndexPage = lazy(() => import("@/pages/resources/faqs"));
const FAQSectionPage = lazy(() => import("@/pages/resources/faqs-section"));
const BlogIndexPage = lazy(() => import("@/pages/resources/blog"));
const BlogPostPage = lazy(() => import("@/pages/resources/blog-post"));
const LeasingPage = lazy(() => import("@/pages/services/leasing"));
const PrimaryProperty = lazy(() => import("@/pages/services/primary-property"));
const PropertyResale = lazy(() => import("@/pages/services/property-resale"));
const InvestmentConsultation = lazy(() => import("@/pages/services/investment-consultation"));
const IncomeGeneratingProperty = lazy(() => import("@/pages/services/income-generating-property"));
const ServicesIndex = lazy(() => import("@/pages/services"));
const WhyPlaces = lazy(() => import("@/pages/why-places"));
const Commercial = lazy(() => import("@/pages/commercial"));
const AdminOffices = lazy(() => import("@/pages/admin"));
const MegaMalls = lazy(() => import("@/pages/commercial/mega-malls"));
const StripMalls = lazy(() => import("@/pages/commercial/strip-malls"));
const DriveThrough = lazy(() => import("@/pages/commercial/drive-through"));
const BusinessBuilding = lazy(() => import("@/pages/admin/business-building"));
const BusinessPark = lazy(() => import("@/pages/admin/business-park"));
const MixedUseMall = lazy(() => import("@/pages/admin/mixed-use"));
const Contact = lazy(() => import("@/pages/contact"));
const Developers = lazy(() => import("@/pages/developers"));
const EmaarPage = lazy(() => import("@/pages/developers/emaar"));
const ArabellaPage = lazy(() => import("@/pages/developers/arabella"));
const AlFuttaimPage = lazy(() => import("@/pages/developers/al-futtaim"));
const MajidAlFuttaimPage = lazy(() => import("@/pages/developers/majid-al-futtaim"));
const LmdPage = lazy(() => import("@/pages/developers/lmd"));
const SodicPage = lazy(() => import("@/pages/developers/sodic"));
const TheWaterwayPage = lazy(() => import("@/pages/developers/the-waterway"));
const MarakezPage = lazy(() => import("@/pages/developers/marakez"));
const ImkanMisrPage = lazy(() => import("@/pages/developers/imkan-misr"));
const TheArkDevelopmentsPage = lazy(() => import("@/pages/developers/the-ark-developments"));
const KvrdPage = lazy(() => import("@/pages/developers/kvrd"));
const PreDevelopmentsPage = lazy(() => import("@/pages/developers/pre-developments"));
const AlRabatPropertiesPage = lazy(() => import("@/pages/developers/al-rabat-properties"));
const AlJaziPage = lazy(() => import("@/pages/developers/al-jazi"));
const HorizonEgyptPage = lazy(() => import("@/pages/developers/horizon-egypt"));
const CatalystPage = lazy(() => import("@/pages/developers/catalyst"));
const AfaaqPage = lazy(() => import("@/pages/developers/afaaq"));
const TownWritersPage = lazy(() => import("@/pages/developers/town-writers"));
const LarzPage = lazy(() => import("@/pages/developers/larz"));
const MorshedyPage = lazy(() => import("@/pages/developers/morshedy"));
const ElSewedyPage = lazy(() => import("@/pages/developers/el-sewedy"));
const InmaPage = lazy(() => import("@/pages/developers/inma-developments"));
const AmerGroupPage = lazy(() => import("@/pages/developers/amer-group"));
const MadinetMasrPage = lazy(() => import("@/pages/developers/madinet-masr"));
const RaslanGroupPage = lazy(() => import("@/pages/developers/raslan-group"));
const UpwydePage = lazy(() => import("@/pages/developers/upwyde"));
const PalmHillsPage = lazy(() => import("@/pages/developers/palm-hills"));
const SkyPage = lazy(() => import("@/pages/developers/sky"));
const OraPage = lazy(() => import("@/pages/developers/ora"));
const AkoyaPage = lazy(() => import("@/pages/developers/akoya"));
const ElHazekPage = lazy(() => import("@/pages/developers/el-hazek"));
const WealthPage = lazy(() => import("@/pages/developers/wealth"));
const Locations = lazy(() => import("@/pages/locations"));
const ProjectsPage = lazy(() => import("@/pages/projects"));
const LocationDetail = lazy(() => import("@/pages/locations/detail"));
const AdminPage = lazy(() => import("@/pages/dashboard"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));

function ScrollToTop() {
  const [location] = useLocation();
  useLayoutEffect(() => {
    // If the URL has a hash (e.g. /resources/faqs#topic), let the page handle it.
    if (window.location.hash) return;
    // Force an instant jump even though html { scroll-behavior: smooth } is set
    // globally for in-page anchor links — otherwise route changes visibly
    // animate from the previous scroll position.
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = previous;
  }, [location]);
  return null;
}

function PageViewTracker() {
  const [location] = useLocation();
  useEffect(() => {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") {
      gtag("event", "page_view", {
        page_path: location,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/listings" component={ListingsPage} />
      <Route path="/listings/:idSlug" component={ListingDetailPage} />
      <Route path="/why-places" component={WhyPlaces} />
      <Route path="/commercial/mega-mall" component={MegaMalls} />
      <Route path="/commercial/strip-mall" component={StripMalls} />
      <Route path="/commercial/drive-through" component={DriveThrough} />
      <Route path="/admin/business-building" component={BusinessBuilding} />
      <Route path="/admin/business-park" component={BusinessPark} />
      <Route path="/admin/mixed-use" component={MixedUseMall} />
      <Route path="/commercial" component={Commercial} />
      <Route path="/admin" component={AdminOffices} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/services" component={ServicesIndex} />
      <Route path="/services/leasing" component={LeasingPage} />
      <Route path="/services/primary-property" component={PrimaryProperty} />
      <Route path="/services/property-resale" component={PropertyResale} />
      <Route path="/services/investment-consultation" component={InvestmentConsultation} />
      <Route path="/services/income-generating-property" component={IncomeGeneratingProperty} />
      <Route path="/glossary" component={GlossaryPage} />
      <Route path="/faqs" component={FAQIndexPage} />
      <Route path="/faqs/:slug" component={FAQSectionPage} />
      <Route path="/blog" component={BlogIndexPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />

      {/* Developer detail pages — must come before the generic /developers/:name fallback */}
      <Route path="/developers/emaar" component={EmaarPage} />
      <Route path="/developers/arabella" component={ArabellaPage} />
      <Route path="/developers/al-futtaim" component={AlFuttaimPage} />
      <Route path="/developers/majid-al-futtaim" component={MajidAlFuttaimPage} />
      <Route path="/developers/lmd" component={LmdPage} />
      <Route path="/developers/sodic" component={SodicPage} />
      <Route path="/developers/the-waterway" component={TheWaterwayPage} />
      <Route path="/developers/marakez" component={MarakezPage} />
      <Route path="/developers/imkan-misr" component={ImkanMisrPage} />
      <Route path="/developers/the-ark-developments" component={TheArkDevelopmentsPage} />
      <Route path="/developers/kvrd" component={KvrdPage} />
      <Route path="/developers/pre-developments" component={PreDevelopmentsPage} />
      <Route path="/developers/al-rabat-properties" component={AlRabatPropertiesPage} />
      <Route path="/developers/al-jazi" component={AlJaziPage} />
      <Route path="/developers/horizon-egypt" component={HorizonEgyptPage} />
      <Route path="/developers/catalyst" component={CatalystPage} />
      <Route path="/developers/afaaq" component={AfaaqPage} />
      <Route path="/developers/town-writers" component={TownWritersPage} />
      <Route path="/developers/larz" component={LarzPage} />
      <Route path="/developers/morshedy" component={MorshedyPage} />
      <Route path="/developers/el-sewedy" component={ElSewedyPage} />
      <Route path="/developers/inma-developments" component={InmaPage} />
      <Route path="/developers/amer-group" component={AmerGroupPage} />
      <Route path="/developers/madinet-masr" component={MadinetMasrPage} />
      <Route path="/developers/raslan-group" component={RaslanGroupPage} />
      <Route path="/developers/upwyde" component={UpwydePage} />
      <Route path="/developers/palm-hills" component={PalmHillsPage} />
      <Route path="/developers/sky" component={SkyPage} />
      <Route path="/developers/ora" component={OraPage} />
      <Route path="/developers/akoya" component={AkoyaPage} />
      <Route path="/developers/el-hazek" component={ElHazekPage} />
      <Route path="/developers/wealth" component={WealthPage} />

      {/* Location detail pages — dynamic template */}
      <Route path="/locations/:slug" component={LocationDetail} />

      {/* Route categories to Listings Page for prototype */}
      <Route path="/commercial/:type" component={ListingsPage} />
      <Route path="/admin/:type" component={ListingsPage} />
      <Route path="/developers/:name" component={ListingsPage} />
      <Route path="/services/:type" component={ListingsPage} />
      <Route path="/developers" component={Developers} />
      <Route path="/locations" component={Locations} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/contact" component={Contact} />
      <Route path="/dashboard" component={AdminPage} />
      {/* 
        For the prototype, other routes will fall back to 404 
        or we can map them to the listings page with different pre-sets 
        if we wanted to go deeper.
      */}
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SchemaMarkup schema={organizationSchema} />
        <SchemaMarkup schema={websiteSchema} />
        <Toaster />
        <ScrollToTop />
        <PageViewTracker />
        <Router />
        <MobileBottomBar />
        <CookieBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route, useLocation } from "wouter";
import { useEffect, useLayoutEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ListingsPage from "@/pages/listings";
import ListingDetailPage from "@/pages/listings/detail";
import GlossaryPage from "@/pages/resources/glossary";
import FAQIndexPage from "@/pages/resources/faqs";
import FAQSectionPage from "@/pages/resources/faqs-section";
import BlogIndexPage from "@/pages/resources/blog";
import BlogPostPage from "@/pages/resources/blog-post";

import LeasingPage from "@/pages/services/leasing";
import PrimaryProperty from "@/pages/services/primary-property";
import PropertyResale from "@/pages/services/property-resale";
import InvestmentConsultation from "@/pages/services/investment-consultation";
import IncomeGeneratingProperty from "@/pages/services/income-generating-property";
import ServicesIndex from "@/pages/services";
import WhyPlaces from "@/pages/why-places";
import Commercial from "@/pages/commercial";
import AdminOffices from "@/pages/admin";
import MegaMalls from "@/pages/commercial/mega-malls";
import StripMalls from "@/pages/commercial/strip-malls";
import DriveThrough from "@/pages/commercial/drive-through";
import BusinessBuilding from "@/pages/admin/business-building";
import BusinessPark from "@/pages/admin/business-park";
import MixedUseMall from "@/pages/admin/mixed-use";
import Contact from "@/pages/contact";
import Developers from "@/pages/developers";
import EmaarPage from "@/pages/developers/emaar";
import ArabellaPage from "@/pages/developers/arabella";
import AlFuttaimPage from "@/pages/developers/al-futtaim";
import MajidAlFuttaimPage from "@/pages/developers/majid-al-futtaim";
import LmdPage from "@/pages/developers/lmd";
import SodicPage from "@/pages/developers/sodic";
import TheWaterwayPage from "@/pages/developers/the-waterway";
import MarakezPage from "@/pages/developers/marakez";
import ImkanMisrPage from "@/pages/developers/imkan-misr";
import TheArkDevelopmentsPage from "@/pages/developers/the-ark-developments";
import KvrdPage from "@/pages/developers/kvrd";
import PreDevelopmentsPage from "@/pages/developers/pre-developments";
import AlRabatPropertiesPage from "@/pages/developers/al-rabat-properties";
import AlJaziPage from "@/pages/developers/al-jazi";
import HorizonEgyptPage from "@/pages/developers/horizon-egypt";
import CatalystPage from "@/pages/developers/catalyst";
import AfaaqPage from "@/pages/developers/afaaq";
import TownWritersPage from "@/pages/developers/town-writers";
import LarzPage from "@/pages/developers/larz";
import MorshedyPage from "@/pages/developers/morshedy";
import ElSewedyPage from "@/pages/developers/el-sewedy";
import InmaPage from "@/pages/developers/inma-developments";
import AmerGroupPage from "@/pages/developers/amer-group";
import MadinetMasrPage from "@/pages/developers/madinet-masr";
import RaslanGroupPage from "@/pages/developers/raslan-group";
import UpwydePage from "@/pages/developers/upwyde";
import PalmHillsPage from "@/pages/developers/palm-hills";
import SkyPage from "@/pages/developers/sky";
import OraPage from "@/pages/developers/ora";
import AkoyaPage from "@/pages/developers/akoya";
import ElHazekPage from "@/pages/developers/el-hazek";
import WealthPage from "@/pages/developers/wealth";
import Locations from "@/pages/locations";
import ProjectsPage from "@/pages/projects";
import LocationDetail from "@/pages/locations/detail";
import AdminPage from "@/pages/dashboard";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";

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

function Router() {
  return (
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

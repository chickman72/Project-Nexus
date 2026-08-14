"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { ArrowUpRight, LayoutGrid, List, LogOut, Search, ShieldCheck, Star, UserCircle } from "lucide-react";
import { DynamicIcon } from "../components/IconHelper";
import toolsData from "../data/content.json";

const FAVORITES_CATEGORY = "Favorites";
const PRODUCTION_SYSTEMS_CATEGORY = "Production Systems";
const DEMO_SYSTEMS_CATEGORY = "Demo Systems";
const FAVORITES_STORAGE_KEY = "project-nexus-favorites";
const NAME_CLAIM_TYPES = [
  "name",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  "http://schemas.microsoft.com/identity/claims/displayname",
];
const EMAIL_CLAIM_TYPES = [
  "emails",
  "email",
  "preferred_username",
  "upn",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
];

function getClaimValue(claims, claimTypes) {
  return claims?.find((claim) => claimTypes.includes(claim.typ))?.val;
}

function getUserInfo(clientPrincipal) {
  if (!clientPrincipal) {
    return null;
  }

  const name = getClaimValue(clientPrincipal.claims, NAME_CLAIM_TYPES);
  const email =
    getClaimValue(clientPrincipal.claims, EMAIL_CLAIM_TYPES) ||
    clientPrincipal.userDetails;

  return {
    name,
    email,
    label: name || email || "Signed in",
  };
}

function isDemoSystem(tool) {
  return tool.systemType === "demo";
}

function isProductionSystem(tool) {
  return !isDemoSystem(tool);
}

function getSystemTypeLabel(tool) {
  return isDemoSystem(tool) ? "Demo Only" : "Production";
}

function getSystemTypeClassName(tool) {
  return isDemoSystem(tool)
    ? "bg-[color:var(--uab-gold-soft)] text-[color:var(--uab-dark-green)] ring-1 ring-[color:var(--uab-gold)]"
    : "bg-[color:var(--uab-green-soft)] text-[color:var(--uab-dark-green)] ring-1 ring-[color:var(--uab-green)]/20";
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(PRODUCTION_SYSTEMS_CATEGORY);
  const [viewMode, setViewMode] = useState("grid");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [authStatus, setAuthStatus] = useState("checking");

  useEffect(() => {
    let ignore = false;

    async function loadUserInfo() {
      try {
        const response = await fetch("/.auth/me");
        if (!response.ok) {
          if (!ignore) {
            setAuthStatus("unavailable");
          }
          return;
        }

        let authInfo = null;
        try {
          authInfo = await response.json();
        } catch {
          authInfo = null;
        }

        if (!ignore) {
          setUserInfo(getUserInfo(authInfo?.clientPrincipal));
          setAuthStatus("available");
        }
      } catch {
        if (!ignore) {
          setUserInfo(null);
          setAuthStatus("unavailable");
        }
      }
    }

    loadUserInfo();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    try {
      const storedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        if (Array.isArray(parsedFavorites)) {
          setFavoriteIds(parsedFavorites);
        }
      }
    } catch {
      setFavoriteIds([]);
    } finally {
      setHasLoadedFavorites(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedFavorites) {
      return;
    }

    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favoriteIds)
    );
  }, [favoriteIds, hasLoadedFavorites]);

  // Derive unique categories from the data
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(toolsData.map((tool) => tool.category))];
    return [
      PRODUCTION_SYSTEMS_CATEGORY,
      DEMO_SYSTEMS_CATEGORY,
      "All",
      FAVORITES_CATEGORY,
      ...uniqueCategories.sort(),
    ];
  }, []);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const toggleFavorite = (toolId) => {
    setFavoriteIds((currentFavoriteIds) =>
      currentFavoriteIds.includes(toolId)
        ? currentFavoriteIds.filter((favoriteId) => favoriteId !== toolId)
        : [...currentFavoriteIds, toolId]
    );
  };

  // Filter tools based on search query and active category
  const filteredTools = useMemo(() => {
    return toolsData.filter((tool) => {
      const matchesCategory =
        activeCategory === "All" ||
        (activeCategory === PRODUCTION_SYSTEMS_CATEGORY && isProductionSystem(tool)) ||
        (activeCategory === FAVORITES_CATEGORY && favoriteIdSet.has(tool.id)) ||
        (activeCategory === DEMO_SYSTEMS_CATEGORY && isDemoSystem(tool)) ||
        tool.category === activeCategory;
      const matchesSearch = searchQuery === "" ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory, favoriteIdSet]);

  const signedInUser = userInfo || { label: "Signed in" };

  return (
    <main className="min-h-screen pb-16">
      <section className="mx-auto max-w-6xl">
        <header className="border-b-4 border-[color:var(--uab-gold)] bg-[color:var(--uab-green)] px-6 py-5 text-white sm:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <img src="/logos/SON_Std_white.png" alt="UAB School of Nursing" className="h-auto w-60 max-w-[60vw] sm:w-72" />
              <div className="hidden h-12 w-px bg-white/30 sm:block" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--uab-gold)]">Internal resource hub</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">Project Nexus</p>
                <p className="text-sm text-white/80">AI &amp; Data Science Resources</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white/85">
              <ShieldCheck className="h-4 w-4 text-[color:var(--uab-gold)]" aria-hidden="true" />
              UAB access only
            </div>
          </div>
        </header>

        <div className="px-6 pt-10 sm:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--uab-green)]">School of Nursing</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-[color:var(--uab-dark-green)] sm:text-5xl">
              Project Nexus
            </h1>
            <p className="mt-4 text-base leading-7 text-[color:var(--text-secondary)] sm:text-lg">
              A central resource for AI, data science, and related tools within the UAB School of Nursing.
            </p>
          </div>
          {authStatus === "available" && (
            <div className="flex flex-col gap-3 rounded-md border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text-secondary)] shadow-sm sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <UserCircle className="h-5 w-5 flex-shrink-0 text-[color:var(--uab-green)]" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[color:var(--text-primary)]">
                    {signedInUser.label}
                  </p>
                  {signedInUser.name && signedInUser.email && signedInUser.name !== signedInUser.email && (
                    <p className="truncate text-xs text-[color:var(--text-secondary)]">{signedInUser.email}</p>
                  )}
                </div>
              </div>
              <a
                href="/.auth/logout?post_logout_redirect_uri=%2F"
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-md border border-[color:var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--uab-green)] transition-colors hover:bg-[color:var(--uab-green-soft)]"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </a>
            </div>
          )}
          </div>

        {/* Control Bar */}
        <div className="mt-10 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--uab-green)]" />
            <input
              type="text"
              placeholder="Search tools by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-[color:var(--border)] bg-white py-3 pl-10 pr-4 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)] shadow-sm focus:border-[color:var(--uab-green)] focus:outline-none focus:ring-2 focus:ring-[color:var(--uab-green)]/20"
            />
          </div>

          {/* Category Tabs and View Toggle */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? "bg-[color:var(--uab-green)] text-white shadow-sm"
                      : "bg-white text-[color:var(--uab-green)] ring-1 ring-[color:var(--border)] hover:bg-[color:var(--uab-green-soft)]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* View Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-[color:var(--uab-green)] text-white"
                    : "bg-white text-[color:var(--uab-green)] ring-1 ring-[color:var(--border)] hover:bg-[color:var(--uab-green-soft)]"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-[color:var(--uab-green)] text-white"
                    : "bg-white text-[color:var(--uab-green)] ring-1 ring-[color:var(--border)] hover:bg-[color:var(--uab-green-soft)]"
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-6 text-sm text-[color:var(--text-secondary)]">
          Showing {filteredTools.length} of {toolsData.length} tools
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="flex flex-col gap-4 rounded-md border border-[color:var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--uab-green)] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[color:var(--uab-green-soft)]">
                    <DynamicIcon
                      iconName={tool.iconName}
                      className="h-6 w-6 text-[color:var(--uab-green)]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(tool.id)}
                    className={`rounded-full p-2 transition-colors ${
                      favoriteIdSet.has(tool.id)
                        ? "bg-[color:var(--uab-gold-soft)] text-[color:var(--uab-dark-green)] hover:bg-[color:var(--uab-gold)]"
                        : "text-[color:var(--text-secondary)] hover:bg-[color:var(--uab-gold-soft)] hover:text-[color:var(--uab-dark-green)]"
                    }`}
                    aria-label={
                      favoriteIdSet.has(tool.id)
                        ? `Remove ${tool.title} from favorites`
                        : `Add ${tool.title} to favorites`
                    }
                    aria-pressed={favoriteIdSet.has(tool.id)}
                    title={
                      favoriteIdSet.has(tool.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Star
                      className="w-5 h-5"
                      fill={favoriteIdSet.has(tool.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Title and Description */}
                <div className="flex-1">
                  <h3 className="font-semibold text-[color:var(--text-primary)]">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    {tool.description}
                  </p>
                </div>

                {/* Category Badge */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full bg-[color:var(--background)] px-3 py-1 text-xs font-medium text-[color:var(--text-secondary)] ring-1 ring-[color:var(--border)]">
                    {tool.category}
                  </span>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getSystemTypeClassName(tool)}`}
                  >
                    {getSystemTypeLabel(tool)}
                  </span>
                </div>

                {/* Action Button */}
                <a
                  href={tool.urls[0]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nexus-button inline-flex w-full items-center justify-center gap-2 rounded-md bg-[color:var(--uab-green)] px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  {tool.urls[0]?.label || "Open"}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="mt-10 space-y-3">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center gap-4 rounded-md border border-[color:var(--border)] bg-white px-6 py-4 shadow-sm transition hover:border-[color:var(--uab-green)] hover:shadow-md"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[color:var(--uab-green-soft)]">
                  <DynamicIcon
                    iconName={tool.iconName}
                  className="h-5 w-5 text-[color:var(--uab-green)]"
                  />
                </div>

                {/* Title, Category, and Description */}
                <div className="flex min-w-0 flex-1 flex-col gap-2 md:grid md:grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)] md:items-center md:gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-[color:var(--text-primary)]">
                      {tool.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="inline-block rounded-full bg-[color:var(--background)] px-2 py-0.5 text-xs font-medium text-[color:var(--text-secondary)] ring-1 ring-[color:var(--border)]">
                        {tool.category}
                      </span>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${getSystemTypeClassName(tool)}`}
                      >
                        {getSystemTypeLabel(tool)}
                      </span>
                    </div>
                  </div>
                  <p className="min-w-0 truncate text-sm text-[color:var(--text-secondary)]">
                    {tool.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFavorite(tool.id)}
                  className={`flex-shrink-0 rounded-full p-2 transition-colors ${
                    favoriteIdSet.has(tool.id)
                        ? "bg-[color:var(--uab-gold-soft)] text-[color:var(--uab-dark-green)] hover:bg-[color:var(--uab-gold)]"
                        : "text-[color:var(--text-secondary)] hover:bg-[color:var(--uab-gold-soft)] hover:text-[color:var(--uab-dark-green)]"
                  }`}
                  aria-label={
                    favoriteIdSet.has(tool.id)
                      ? `Remove ${tool.title} from favorites`
                      : `Add ${tool.title} to favorites`
                  }
                  aria-pressed={favoriteIdSet.has(tool.id)}
                  title={
                    favoriteIdSet.has(tool.id)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Star
                    className="w-5 h-5"
                    fill={favoriteIdSet.has(tool.id) ? "currentColor" : "none"}
                  />
                </button>

                {/* Action Button */}
                <a
                  href={tool.urls[0]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="nexus-button flex-shrink-0 rounded-md bg-[color:var(--uab-green)] px-4 py-2.5 text-sm font-semibold text-white whitespace-nowrap"
                >
                  {tool.urls[0]?.label || "Open"}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="mt-10 rounded-md border border-[color:var(--border)] bg-white px-6 py-12 text-center">
            <p className="text-[color:var(--text-secondary)]">
              {activeCategory === FAVORITES_CATEGORY
                ? "No favorites found. Star tools to add them here."
                : activeCategory === PRODUCTION_SYSTEMS_CATEGORY
                  ? "No production systems found."
                : activeCategory === DEMO_SYSTEMS_CATEGORY
                  ? "No demo systems found. Update a tool's systemType to demo to show it here."
                : "No tools found matching your search. Try adjusting your filters or search query."}
            </p>
          </div>
        )}

        <footer className="mt-14 border-t border-[color:var(--border)] pt-6 text-sm leading-6 text-[color:var(--text-secondary)]">
          <p>
            Contact:{" "}
            <a
              href="mailto:cahickma@uab.edu"
              className="font-semibold text-[color:var(--uab-green)] hover:text-[color:var(--uab-dark-green)]"
            >
              cahickma@uab.edu
            </a>
          </p>
          <p className="mt-3">
            Responsible Use of AI tools: Users are responsible for reviewing AI-generated
            content for accuracy, appropriateness, privacy, and compliance with UAB
            policies before relying on or sharing outputs.
          </p>
          <p className="mt-3 font-semibold text-[color:var(--text-primary)]">
            These tools are not approved for use with patient data without further
            authorization.
          </p>
        </footer>
        </div>
      </section>

      <nexus-chat-widget />
      <Script src="/embed.js" strategy="afterInteractive" />
    </main>
  );
}

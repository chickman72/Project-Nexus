"use client";

import { useState, useMemo } from "react";
import Script from "next/script";
import { LayoutGrid, List, Search } from "lucide-react";
import { DynamicIcon } from "../components/IconHelper";
import toolsData from "../data/content.json";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  // Derive unique categories from the data
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(toolsData.map((tool) => tool.category))];
    return ["All", ...uniqueCategories.sort()];
  }, []);

  // Filter tools based on search query and active category
  const filteredTools = useMemo(() => {
    return toolsData.filter((tool) => {
      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
      const matchesSearch = searchQuery === "" ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <main className="min-h-screen px-6 pb-20 pt-12 sm:px-10">
      <section className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              School of Nursing
            </p>
            <h1 className="font-display text-4xl font-semibold text-[color:var(--nexus-blue)] sm:text-5xl">
              Project Nexus
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              A launchpad for clinical education, research support, and compliance tooling.
            </p>
          </div>
        </div>

        {/* Control Bar */}
        <div className="mt-10 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-6 text-sm text-slate-500">
          Showing {filteredTools.length} of {toolsData.length} tools
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50">
                  <DynamicIcon
                    iconName={tool.iconName}
                    className="w-6 h-6 text-blue-600"
                  />
                </div>

                {/* Title and Description */}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{tool.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {tool.description}
                  </p>
                </div>

                {/* Category Badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {tool.category}
                  </span>
                </div>

                {/* Action Button */}
                <a
                  href={tool.urls[0]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {tool.urls[0]?.label || "Open"}
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
                className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Icon */}
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                  <DynamicIcon
                    iconName={tool.iconName}
                    className="w-5 h-5 text-blue-600"
                  />
                </div>

                {/* Title and Category */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {tool.title}
                  </h3>
                  <div className="mt-1">
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {tool.category}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <a
                  href={tool.urls[0]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap"
                >
                  {tool.urls[0]?.label || "Open"}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-slate-600">
              No tools found matching your search. Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </section>

      <nexus-chat-widget />
      <Script src="/embed.js" strategy="afterInteractive" />
    </main>
  );
}

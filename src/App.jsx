import { useEffect, useState } from "react";

const API_URL = "https://sheetdb.io/api/v1/o4iy8coei0doo";

const ALL_SECTIONS = "All";
const NO_SECTION = "Other";

// Header names in the sheet can drift (Google Sheets renames a header to
// "Columna 4" when the range becomes a table), so each field accepts aliases.
const FIELD_ALIASES = {
  id: ["id"],
  section: ["seccion", "section"],
  name: ["name", "nombre"],
  ingredients: ["ingredients", "ingredientes", "columna 4"],
  method: ["method", "metodo"],
  glass: ["glass", "vaso"],
  garnish: ["garnish", "guarnicion", "columna 7"],
};

// lowercase and strip accents, so "creme" finds "crème" and "Sección" matches "seccion"
const normalizeText = (text) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

function readField(row, field) {
  const aliases = FIELD_ALIASES[field];
  const key = Object.keys(row).find((k) => aliases.includes(normalizeText(k)));
  return key ? String(row[key] ?? "").trim() : "";
}

function App() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState(ALL_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch recipes");
        const data = await res.json();

        const formatted = data
          .map((row, index) => {
            const id = readField(row, "id");
            const ingredients = readField(row, "ingredients");
            return {
              // ids can repeat in the sheet, so the row position keeps keys unique
              key: `${index}-${id}`,
              id,
              section: readField(row, "section") || NO_SECTION,
              name: readField(row, "name"),
              ingredients: ingredients
                ? ingredients
                    .split(/[,;]/)
                    .map((i) => i.trim())
                    .filter(Boolean)
                : [],
              method: readField(row, "method"),
              glass: readField(row, "glass"),
              garnish: readField(row, "garnish"),
            };
          })
          .filter((recipe) => recipe.name);

        setRecipes(formatted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  // mostrar / ocultar botón "Back to top"
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // cuando empiezo / sigo escribiendo, sube al principio
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSectionChange = (section, chip) => {
    setActiveSection(section);
    // keep the selected chip visible inside the horizontal chip row
    chip.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // sections in alphabetical order, with recipes that have none at the end
  const sectionCounts = recipes.reduce((counts, recipe) => {
    counts[recipe.section] = (counts[recipe.section] || 0) + 1;
    return counts;
  }, {});
  const sections = Object.keys(sectionCounts).sort((a, b) => {
    if (a === NO_SECTION) return 1;
    if (b === NO_SECTION) return -1;
    return a.localeCompare(b);
  });

  const normalizedQuery = normalizeText(query);
  const matches = (text) => normalizeText(text).includes(normalizedQuery);

  const filteredRecipes = recipes
    .filter((recipe) => {
      if (activeSection !== ALL_SECTIONS && recipe.section !== activeSection) {
        return false;
      }
      if (!normalizedQuery) return true;

      return (
        matches(recipe.name) ||
        matches(recipe.glass) ||
        matches(recipe.garnish) ||
        recipe.ingredients.some(matches) ||
        matches(recipe.method)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen flex flex-col bg-[#0d2f16] text-[#24391c]">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 flex-1">
        {/* TÍTULO (scrollea normal) */}
        <div className="pt-12 pb-6 mb-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-[#fefdf8] tracking-[0.12em]">
            GIN LANE COCKTAIL BOOK 
          </h1>
        </div>

        {/* SEARCH BAR STICKY */}
        <header className="sticky top-0 z-20 bg-[#0d2f16]/95 backdrop-blur-sm border-b border-[#1f4a2a] pt-3 pb-3 mb-8">
          <input
            type="text"
            placeholder="Search by name, ingredient, glass..."
            value={query}
            onChange={handleQueryChange}
            className="w-full p-4 rounded-md bg-[#144422] border border-[#1f4a2a]
                       text-[#fefdf8] placeholder:text-[#e5dfc6] text-sm
                       focus:outline-none focus:border-[#e5dfc6] transition"
          />

          {sections.length > 1 && (
            <nav
              aria-label="Filter by section"
              className="mt-2 -mx-1 flex gap-2 overflow-x-auto p-1"
            >
              {[ALL_SECTIONS, ...sections].map((section) => {
                const isActive = section === activeSection;
                const count =
                  section === ALL_SECTIONS
                    ? recipes.length
                    : sectionCounts[section];
                return (
                  <button
                    key={section}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={`${section}, ${count} recipe${count !== 1 ? "s" : ""}`}
                    onClick={(e) => handleSectionChange(section, e.currentTarget)}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs tracking-wide transition ${
                      isActive
                        ? "bg-[#e5dfc6] border-[#e5dfc6] text-[#0d2f16] font-semibold"
                        : "bg-[#144422] border-[#1f4a2a] text-[#fefdf8] hover:border-[#e5dfc6]"
                    }`}
                  >
                    {section}
                    <span className="ml-1 opacity-70">{count}</span>
                  </button>
                );
              })}
            </nav>
          )}

          <p className="mt-2 text-xs text-[#fefdf8]/70 text-right">
            {loading
              ? "Loading recipes…"
              : error
              ? "Error loading recipes"
              : `${filteredRecipes.length} recipe${
                  filteredRecipes.length !== 1 ? "s" : ""
                } found`}
          </p>
        </header>

        {/* CONTENIDO */}
        <main className="space-y-6 pb-32">
          {error && (
            <div className="bg-red-600/20 border border-red-500 rounded-lg p-4 text-red-100 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center text-[#fefdf8] text-sm animate-pulse">
              Loading recipes…
            </div>
          )}

          {!loading && !error && filteredRecipes.length === 0 && (
            <div className="p-6 bg-[#144422] border border-[#1f4a2a] text-center rounded-lg text-[#fefdf8]">
              {normalizedQuery ? (
                <>
                  No results for <strong>{query}</strong>
                  {activeSection !== ALL_SECTIONS && (
                    <> in {activeSection}</>
                  )}
                  .
                </>
              ) : (
                <>
                  No recipes
                  {activeSection !== ALL_SECTIONS && <> in {activeSection}</>}.
                </>
              )}
              <br />
              Try another cocktail.
            </div>
          )}

          {!loading && !error && filteredRecipes.length > 0 && (
            <section className="grid gap-6 md:grid-cols-2">
              {filteredRecipes.map((recipe) => (
                <article
                  key={recipe.key}
                  className="bg-[#fef7dd] text-[#24391c] rounded-xl border border-[#e7d7ad]
                             p-6 shadow-[0_4px_12px_rgba(0,0,0,0.25)] space-y-4
                             transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(0,0,0,0.30)]"
                >
                  <header>
                    {recipe.section !== NO_SECTION && (
                      <p className="mb-1 uppercase text-[10px] tracking-[0.2em] text-[#24391c]/60">
                        {recipe.section}
                      </p>
                    )}
                    <h2 className="text-xl font-serif font-bold tracking-wide">
                      {recipe.name}
                    </h2>

                    <p className="mt-1 uppercase text-[11px] tracking-widest text-[#d48b2f] font-semibold">
                      Glass:{" "}
                      <span className="font-normal text-[#24391c]">
                        {recipe.glass || "—"}
                      </span>
                    </p>

                    {recipe.garnish && (
                      <p className="uppercase text-[11px] tracking-widest text-[#d48b2f] font-semibold">
                        Garnish:{" "}
                        <span className="font-normal text-[#24391c]">
                          {recipe.garnish}
                        </span>
                      </p>
                    )}
                  </header>

                  {recipe.ingredients?.length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-semibold uppercase text-[#d48b2f] mb-1 tracking-wide">
                        Ingredients
                      </h3>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={`${i}-${ing}`}>{ing}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {recipe.method && (
                    <section>
                      <h3 className="text-[11px] font-semibold uppercase text-[#d48b2f] mb-1 tracking-wide">
                        Method Notes
                      </h3>
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {recipe.method}
                      </p>
                    </section>
                  )}
                </article>
              ))}
            </section>
          )}
        </main>
      </div>

      {/* BOTÓN BACK TO TOP */}
      {showScrollTop && (
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="fixed bottom-16 right-4 md:right-8 bg-[#144422] text-[#fefdf8] text-xs px-3 py-2 rounded-md border border-[#1f4a2a] shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:bg-[#1b572a] transition z-40"
        >
          ↑ Back to top
        </button>
      )}

      {/* FOOTER FIJO */}
      <footer className="fixed bottom-0 left-0 w-full text-center text-[11px] text-[#fefdf8]/70 py-3 bg-[#0d2f16]/95 border-t border-[#1f4a2a] backdrop-blur-sm">
        
        Recipe Finder — by Josefina Tersoli • 2025
      </footer>
    </div>
  );
}

export default App;


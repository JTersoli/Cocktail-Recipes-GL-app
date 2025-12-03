import { useEffect, useState } from "react";

const API_URL = "https://sheetdb.io/api/v1/o4iy8coei0doo";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState("");
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

        const formatted = data.map((row) => ({
          id: row.id,
          name: row.name,
          ingredients: row.ingredients
            ? row.ingredients.split(",").map((i) => i.trim())
            : [],
          method: row.method || "",
          glass: row.glass || "",
          garnish: row.garnish || "",
        }));

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

  const normalizedQuery = query.toLowerCase().trim();

  const filteredRecipes = recipes
    .filter((recipe) => {
      if (!normalizedQuery) return true;

      const inName = recipe.name?.toLowerCase().includes(normalizedQuery);
      const inGlass = recipe.glass?.toLowerCase().includes(normalizedQuery);
      const inGarnish = recipe.garnish
        ?.toLowerCase()
        .includes(normalizedQuery);
      const inIngredients = recipe.ingredients?.some((ing) =>
        ing.toLowerCase().includes(normalizedQuery)
      );
      const inMethod = recipe.method?.toLowerCase().includes(normalizedQuery);

      return inName || inGlass || inGarnish || inIngredients || inMethod;
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
            placeholder="Search by name..."
            value={query}
            onChange={handleQueryChange}
            className="w-full p-4 rounded-md bg-[#144422] border border-[#1f4a2a]
                       text-[#fefdf8] placeholder:text-[#e5dfc6] text-sm
                       focus:outline-none focus:border-[#e5dfc6] transition"
          />

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
              No results for <strong>{query}</strong>.
              <br />
              Try another cocktail.
            </div>
          )}

          {!loading && !error && filteredRecipes.length > 0 && (
            <section className="grid gap-6 md:grid-cols-2">
              {filteredRecipes.map((recipe) => (
                <article
                  key={recipe.id || recipe.name}
                  className="bg-[#fef7dd] text-[#24391c] rounded-xl border border-[#e7d7ad]
                             p-6 shadow-[0_4px_12px_rgba(0,0,0,0.25)] space-y-4
                             transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(0,0,0,0.30)]"
                >
                  <header>
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
                        {recipe.ingredients.map((ing) => (
                          <li key={ing}>{ing}</li>
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


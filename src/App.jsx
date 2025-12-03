import { useEffect, useState } from "react";

// ⬇️ PONÉ ACÁ TU URL DE SHEETDB
const API_URL = "https://sheetdb.io/api/v1/o4iy8coei0doo";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load recipes from Google Sheet (via SheetDB)
  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await res.json();

        // Format data from the sheet
        const formatted = data.map((row) => ({
          id: row.id,
          name: row.name,
          ingredients: row.ingredients
            ? row.ingredients
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean)
            : [],
          method: row.method || "",
          glass: row.glass || "",
          garnish: row.garnish || "",
        }));

        setRecipes(formatted);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  const normalizedQuery = query.toLowerCase().trim();

  const filteredRecipes = recipes.filter((recipe) => {
    if (!normalizedQuery) return true;

    const inName = recipe.name?.toLowerCase().includes(normalizedQuery);
    const inGlass = recipe.glass?.toLowerCase().includes(normalizedQuery);
    const inGarnish = recipe.garnish?.toLowerCase().includes(normalizedQuery);
    const inIngredients = recipe.ingredients?.some((ing) =>
      ing.toLowerCase().includes(normalizedQuery)
    );
    const inMethod = recipe.method?.toLowerCase().includes(normalizedQuery);

    return inName || inGlass || inGarnish || inIngredients || inMethod;
  });

  return (
    <div className="min-h-screen bg-[#0d2f16] text-[#24391c]">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-10">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#0d2f16]/95 backdrop-blur-sm border-b border-[#1f4a2a] pt-8 pb-6 mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-center text-[#fefdf8] tracking-[0.2em] mb-8">
            COCKTAIL RECIPE FINDER
          </h1>

          <input
            type="text"
            placeholder="Search by name, ingredient, glass..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 rounded-md bg-[#144422] border border-[#1f4a2a]
                       text-[#fefdf8] placeholder:text-[#e5dfc6] text-sm
                       focus:outline-none focus:border-[#e5dfc6] transition"
          />

          <p className="mt-3 text-xs text-[#fefdf8]/70 text-right">
            {loading
              ? "Loading recipes..."
              : error
              ? "Error loading recipes"
              : `${filteredRecipes.length} recipe${
                  filteredRecipes.length !== 1 ? "s" : ""
                } found`}
          </p>
        </header>

        <main className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/50 bg-red-500/15 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          {!error && loading && (
            <div className="rounded-xl border border-[#1f4a2a] bg-[#144422] p-4 text-sm text-[#fefdf8]">
              Loading recipes…
            </div>
          )}

          {!loading && !error && filteredRecipes.length === 0 && (
            <div className="rounded-xl border border-[#1f4a2a] bg-[#144422] p-4 text-center text-sm text-[#fefdf8]">
              No recipes found for <strong>{query}</strong>. Try another word.
            </div>
          )}

          {!loading && !error && filteredRecipes.length > 0 && (
            <section className="grid gap-6 md:grid-cols-2">
              {filteredRecipes.map((recipe) => (
                <article
                  key={recipe.id || recipe.name}
                  className="bg-[#fef7dd] text-[#24391c] rounded-xl border border-[#e7d7ad]
                             p-6 shadow-[0_4px_12px_rgba(0,0,0,0.25)] space-y-4"
                >
                  {/* Header de la card */}
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

                  {/* Ingredientes */}
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

                  {/* Método */}
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
    </div>
  );
}

export default App;

import React, { useEffect, useState } from "react"
import "./App.css"
import { Tool } from "./types"
import { fetchTools, fetchCategories, fetchTags, createTool } from "./api"

import ToolCard from "./components/ToolCard"
import ToolDetail from "./components/ToolDetail"
import SubmitForm from "./components/SubmitForm"

function App() {
  const [tools, setTools] = useState<Tool[]>([])
  const [q, setQ] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [tag, setTag] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [selected, setSelected] = useState<Tool | null>(null)
  const [showSubmit, setShowSubmit] = useState(false)

  async function load() {
    try {
      const t = await fetchTools({ q, category: category ?? undefined, tag: tag ?? undefined })
      setTools(t)
      const cs = await fetchCategories()
      setCategories(cs)
      const ts = await fetchTags()
      setTags(ts)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, tag])

  const onSubmit = async (payload: Omit<Tool, "id">) => {
    const created = await createTool(payload)
    setShowSubmit(false)
    // refresh list
    setQ("")
    setCategory(null)
    setTag(null)
    await load()
    setSelected(created)
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>AI Tool Finder</h1>
        <div className="controls">
          <input className="search" placeholder="Search tools..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button onClick={() => setShowSubmit((s) => !s)}>{showSubmit ? "Close" : "Submit a Tool"}</button>
        </div>
      </header>

      {showSubmit ? (
        <div className="submit-area">
          <SubmitForm onSubmit={onSubmit} onCancel={() => setShowSubmit(false)} />
        </div>
      ) : (
        <main className="main">
          <aside className="sidebar">
            <h3>Categories</h3>
            <ul>
              <li className={!category ? "active" : ""} onClick={() => setCategory(null)}>
                All
              </li>
              {categories.map((c) => (
                <li key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>
                  {c}
                </li>
              ))}
            </ul>

            <h3>Tags</h3>
            <div className="tags">
              <button className={!tag ? "chip active" : "chip"} onClick={() => setTag(null)}>
                All
              </button>
              {tags.map((t) => (
                <button key={t} className={tag === t ? "chip active" : "chip"} onClick={() => setTag(t)}>
                  {t}
                </button>
              ))}
            </div>
          </aside>

          <section className="content">
            <div className="tool-grid">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onOpen={() => setSelected(tool)} />
              ))}
            </div>
          </section>
        </main>
      )}

      {selected && <ToolDetail tool={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

export default App

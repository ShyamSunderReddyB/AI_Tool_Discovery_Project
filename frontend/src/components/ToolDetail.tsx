import React from "react"
import { Tool } from "../types"

export default function ToolDetail({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>{tool.name}</h2>
          <button onClick={onClose}>Close</button>
        </header>
        <section>
          <p>{tool.description}</p>
          {tool.url && (
            <p>
              <a href={tool.url} target="_blank" rel="noreferrer">
                Visit
              </a>
            </p>
          )}
          <p>
            <strong>Categories:</strong> {tool.categories.join(", ")}
          </p>
          <p>
            <strong>Tags:</strong> {tool.tags.join(", ")}
          </p>
        </section>
      </div>
    </div>
  )
}

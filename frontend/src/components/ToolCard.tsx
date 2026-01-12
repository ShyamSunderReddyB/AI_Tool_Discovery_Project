import React from "react";
import { Tool } from "../types";

export default function ToolCard({
  tool,
  onOpen,
}: {
  tool: Tool;
  onOpen?: () => void;
}) {
  return (
    <article className="tool-card" onClick={onOpen}>
      <div className="tool-card-body">
        <h4 className="tool-name">{tool.name}</h4>
        <p className="tool-desc">{tool.description}</p>
      </div>
      <div className="tool-meta">
        <div className="cats">{tool.categories.join(", ")}</div>
        <div className="tags">
          {tool.tags.slice(0, 5).map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

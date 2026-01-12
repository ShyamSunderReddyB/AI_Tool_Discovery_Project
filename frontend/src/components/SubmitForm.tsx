import React, { useState } from "react";
import { Tool } from "../types";

export default function SubmitForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: Omit<Tool, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [tags, setTags] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      url: url || undefined,
      description: description || undefined,
      categories: categories ? categories.split(",").map((s) => s.trim()) : [],
      tags: tags ? tags.split(",").map((s) => s.trim()) : [],
    });
  }

  return (
    <form className="submit-form" onSubmit={submit}>
      <label>
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label>
        URL
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
      </label>
      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label>
        Categories (comma separated)
        <input
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
        />
      </label>
      <label>
        Tags (comma separated)
        <input value={tags} onChange={(e) => setTags(e.target.value)} />
      </label>
      <div className="submit-actions">
        <button type="submit">Submit</button>
        <button type="button" onClick={onCancel} className="muted">
          Cancel
        </button>
      </div>
    </form>
  );
}

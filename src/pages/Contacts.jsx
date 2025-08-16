import { useEffect, useState } from "react";
import http from "../api/http";

export default function Contacts() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "",
    preferred: false,
  });
  const [err, setErr] = useState("");

  const load = async () => {
    const { data } = await http.get("/contacts");
    setList(data.contacts || []);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await http.post("/contacts", form);
      setForm({
        name: "",
        phone: "",
        email: "",
        relationship: "",
        preferred: false,
      });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add");
    }
  };

  const remove = async (id) => {
    await http.delete(`/contacts/${id}`);
    await load();
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Trusted Contacts</h2>
      <form onSubmit={add} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <input
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Relationship"
          value={form.relationship}
          onChange={(e) => setForm({ ...form, relationship: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={form.preferred}
            onChange={(e) => setForm({ ...form, preferred: e.target.checked })}
          />{" "}
          Preferred
        </label>
        {err && <p style={{ color: "crimson" }}>{err}</p>}
        <button type="submit">Add</button>
      </form>

      <hr />
      <ul>
        {list.map((c) => (
          <li
            key={c._id}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <span>
              {c.name} — {c.phone} {c.preferred ? "⭐" : ""}
            </span>
            <button onClick={() => remove(c._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

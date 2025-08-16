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
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Trusted Contacts</h2>
      <form onSubmit={add} className="grid gap-4 max-w-lg bg-white p-6 rounded-lg shadow-md">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="Relationship"
          value={form.relationship}
          onChange={(e) => setForm({ ...form, relationship: e.target.value })}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={form.preferred}
            onChange={(e) => setForm({ ...form, preferred: e.target.checked })}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          Preferred
        </label>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button type="submit" className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors">Add</button>
      </form>

      <hr className="my-8 border-gray-300" />
      <ul className="space-y-4">
        {list.map((c) => (
          <li
            key={c._id}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
          >
            <span className="text-gray-800">
              {c.name} — {c.phone} {c.preferred ? <span role="img" aria-label="star">⭐</span> : ""}
            </span>
            <button onClick={() => remove(c._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useState } from "react";
import { api, formatApiError } from "../lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/contact", form);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message received. We'll be in touch.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-20" data-testid="contact-page">
      <div className="eyebrow mb-4">Say Hello</div>
      <h1 className="font-serif text-5xl md:text-6xl text-forest-900 leading-tight">Reader notes.</h1>
      <p className="text-forest-500 text-lg mt-5 leading-relaxed">
        Questions, feedback, or a quick hello are always welcome. We read every message that comes in.
      </p>

      <form onSubmit={submit} className="mt-12 space-y-5 bg-white border border-sand-300 p-8" data-testid="contact-form">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="contact-name" />
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} testid="contact-email" />
        </div>
        <Field label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} testid="contact-subject" />
        <div>
          <label className="eyebrow block mb-2">Message</label>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full bg-sand-50 border border-sand-300 px-4 py-3 focus:outline-none focus:border-sage"
            data-testid="contact-message"
          />
        </div>
        <button disabled={busy} className="btn-primary" data-testid="contact-submit">
          {busy ? "Sending..." : "Send message"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", testid }) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-sand-50 border border-sand-300 px-4 py-3 focus:outline-none focus:border-sage"
        data-testid={testid}
      />
    </div>
  );
}

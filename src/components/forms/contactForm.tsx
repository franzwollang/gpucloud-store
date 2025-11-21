'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/style';

interface ContactFormProps {
  translations: {
    name: { label: string; placeholder: string };
    company: { label: string; placeholder: string };
    email: { label: string; placeholder: string };
    role: { label: string; placeholder: string };
    message: { label: string; placeholder: string };
    hint: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    networkError: string;
    submitError: string;
  };
}

export function ContactForm({ translations }: ContactFormProps) {
  const [formStatus, setFormStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const message = formData.get('message')?.toString().trim() || '';

    if (!name || !email || !message) {
      setFormStatus({ type: 'error', message: translations.error });
      return;
    }

    setFormStatus({ type: 'loading', message: '' });

    try {
      const payload = {
        name,
        company: formData.get('company')?.toString().trim() || '',
        email,
        role: formData.get('role')?.toString().trim() || '',
        message
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormStatus({ type: 'success', message: translations.success });
        form.reset();
      } else {
        let errorMessage = translations.submitError;
        try {
          const data = await response.json();
          if (data.error) errorMessage = data.error;
        } catch (err) {
          // Use default error message
        }
        setFormStatus({ type: 'error', message: errorMessage });
      }
    } catch (err) {
      console.error(err);
      setFormStatus({ type: 'error', message: translations.networkError });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-cyan-400/40 bg-linear-to-br from-cyan-950/40 via-slate-950/60 to-purple-950/40 p-5 shadow-[0_0_22px_rgba(0,255,255,0.45),0_0_40px_rgba(0,0,0,1)]"
    >
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-xs tracking-widest text-cyan-300 uppercase"
          >
            {translations.name.label}
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={translations.name.placeholder}
            required
            className="border-cyan-400/50 bg-slate-950/90 text-slate-100 placeholder:text-slate-500 focus-visible:border-pink-500/90 focus-visible:shadow-[0_0_12px_rgba(0,255,255,0.7),0_0_28px_rgba(0,0,0,1)] focus-visible:ring-pink-500/90"
          />
        </div>
        <div>
          <label
            htmlFor="company"
            className="mb-1.5 block text-xs tracking-widest text-cyan-300 uppercase"
          >
            {translations.company.label}
          </label>
          <Input
            id="company"
            name="company"
            type="text"
            placeholder={translations.company.placeholder}
            className="border-cyan-400/50 bg-slate-950/90 text-slate-100 placeholder:text-slate-500 focus-visible:border-pink-500/90 focus-visible:shadow-[0_0_12px_rgba(0,255,255,0.7),0_0_28px_rgba(0,0,0,1)] focus-visible:ring-pink-500/90"
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs tracking-widest text-cyan-300 uppercase"
          >
            {translations.email.label}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={translations.email.placeholder}
            required
            className="border-cyan-400/50 bg-slate-950/90 text-slate-100 placeholder:text-slate-500 focus-visible:border-pink-500/90 focus-visible:shadow-[0_0_12px_rgba(0,255,255,0.7),0_0_28px_rgba(0,0,0,1)] focus-visible:ring-pink-500/90"
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="mb-1.5 block text-xs tracking-widest text-cyan-300 uppercase"
          >
            {translations.role.label}
          </label>
          <Input
            id="role"
            name="role"
            type="text"
            placeholder={translations.role.placeholder}
            className="border-cyan-400/50 bg-slate-950/90 text-slate-100 placeholder:text-slate-500 focus-visible:border-pink-500/90 focus-visible:shadow-[0_0_12px_rgba(0,255,255,0.7),0_0_28px_rgba(0,0,0,1)] focus-visible:ring-pink-500/90"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="message"
          className="mb-1.5 block text-xs tracking-widest text-cyan-300 uppercase"
        >
          {translations.message.label}
        </label>
        <Textarea
          id="message"
          name="message"
          placeholder={translations.message.placeholder}
          required
          className="min-h-[120px] border-cyan-400/50 bg-slate-950/90 text-slate-100 placeholder:text-slate-500 focus-visible:border-pink-500/90 focus-visible:shadow-[0_0_12px_rgba(0,255,255,0.7),0_0_28px_rgba(0,0,0,1)] focus-visible:ring-pink-500/90"
        />
      </div>

      <div className="mb-4 text-xs text-slate-400">{translations.hint}</div>

      {formStatus.message && (
        <div
          className={cn(
            'mb-3 min-h-[1.2em] text-sm',
            formStatus.type === 'error' && 'text-pink-300',
            formStatus.type === 'success' && 'text-cyan-300'
          )}
          role="alert"
          aria-live="polite"
        >
          {formStatus.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={formStatus.type === 'loading'}
        className="rounded-full bg-linear-to-br from-cyan-400 to-blue-600 px-6 py-3 text-sm tracking-widest text-slate-950 uppercase shadow-[0_0_22px_rgba(0,255,255,0.9),0_0_46px_rgba(0,0,0,0.9)] transition-all duration-200 hover:from-cyan-400 hover:to-pink-500 hover:shadow-[0_0_30px_rgba(0,255,255,1),0_0_52px_rgba(0,0,0,1)]"
      >
        {formStatus.type === 'loading'
          ? translations.submitting
          : translations.submit}
      </Button>
    </form>
  );
}

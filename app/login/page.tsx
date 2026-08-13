"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  login: z.string().min(3, "Телефон ёки email киритинг"),
  password: z.string().min(6, "Парол камида 6 та белги бўлиши керак"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const serverOnlyMode =
    process.env.NEXT_PUBLIC_APP_MODE === "server_only" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);

    if (serverOnlyMode) {
      setLoading(false);
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.login,
      password: values.password,
    });

    setLoading(false);

    if (error) {
      setError("Логин ёки парол нотўғри.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#f9e8d0_0,#efe9dd_40%,#e6dfcf_100%)] p-6">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-[#d6c8af] bg-[#fffaf0]/90 p-8 shadow-[0_20px_70px_-35px_rgba(80,45,10,0.45)] backdrop-blur">
          <p className="text-3xl font-black tracking-wide text-[#5b3f25]">AKBEL CRM</p>
          <p className="mt-2 text-sm text-[#6a5b47]">Тизимга киринг</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4b3d2d]">Телефон ёки Email</label>
              <input
                {...register("login")}
                className="w-full rounded-xl border border-[#d9cdb9] bg-white px-3 py-2 outline-none ring-[#9f6d3f] focus:ring"
                placeholder="+998901234567 ёки user@mail.com"
              />
              {formState.errors.login && <p className="mt-1 text-xs text-rose-600">{formState.errors.login.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4b3d2d]">Парол</label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-xl border border-[#d9cdb9] bg-white px-3 py-2 outline-none ring-[#9f6d3f] focus:ring"
                placeholder="••••••••"
              />
              {formState.errors.password && (
                <p className="mt-1 text-xs text-rose-600">{formState.errors.password.message}</p>
              )}
            </div>

            {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-xl bg-[#8b5e34] px-4 py-3 text-sm font-bold text-white hover:bg-[#764f2c] disabled:opacity-60"
            >
              {loading ? "Кутинг..." : "Кириш"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

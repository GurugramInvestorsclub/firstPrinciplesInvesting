import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default async function DashboardPage() {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/login")
    }

    return (
        <main className="min-h-screen bg-bg-deep pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12 animate-fade-in">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gold/20 shadow-2xl">
                        {session.user.image ? (
                            <Image
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-bg-primary flex items-center justify-center text-4xl font-bold text-gold">
                                {session.user.name?.[0] || session.user.email?.[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold text-text-primary mb-2">
                            {session.user.name || "Investor"}
                        </h1>
                        <p className="text-text-secondary text-lg">
                            {session.user.email}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                             <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium uppercase tracking-wider">
                                Active Member
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-200">
                    <div className="bg-bg-primary/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-gold/30 transition-all group">
                        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold" />
                            My Investments
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Track your participation in upcoming events and briefings.
                        </p>
                        <Link
                            href="/events"
                            className="inline-flex items-center text-gold font-medium hover:gap-2 transition-all gap-1"
                        >
                            Explore Events <span className="text-lg">→</span>
                        </Link>
                    </div>

                    <div className="bg-bg-primary/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-gold/30 transition-all">
                        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold" />
                            Settings & Profile
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Manage your personal information and subscription preferences.
                        </p>
                        <form
                            action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/" })
                            }}
                        >
                            <button
                                type="submit"
                                className="text-destructive hover:text-red-400 font-medium transition-colors"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}

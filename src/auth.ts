import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { addSubscriberToBrevoRegisteredList } from "@/lib/brevo-crm-service"

const baseAdapter = PrismaAdapter(prisma)
const adapter = {
    ...baseAdapter,
    async getUserByEmail(email: string) {
        if (!baseAdapter.getUserByEmail) return null
        const user = await baseAdapter.getUserByEmail(email)
        if (user) return user

        const secondary = await prisma.userSecondaryEmail.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: { user: true },
        })
        if (secondary?.user) {
            return secondary.user as any
        }
        return null
    },
}

const {
    handlers,
    auth,
    signIn,
    signOut
} = NextAuth({
    ...authConfig,
    adapter,
    providers: [
        ...authConfig.providers,
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const inputEmail = (credentials.email as string).trim().toLowerCase()
                let user = await prisma.user.findUnique({
                    where: { email: inputEmail },
                })

                if (!user) {
                    const secondary = await prisma.userSecondaryEmail.findUnique({
                        where: { email: inputEmail },
                        include: { user: true },
                    })
                    if (secondary?.user) {
                        user = secondary.user
                    }
                }

                if (!user || !user.password) {
                    return null
                }

                const isVerified = user.emailVerified || process.env.NODE_ENV !== "production"
                if (!isVerified) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            },
        }),
    ],
    events: {
        async signIn({ user, account }) {
            if (user?.email) {
                addSubscriberToBrevoRegisteredList({
                    email: user.email,
                    name: user.name,
                }).catch((err) => {
                    console.error("Failed to sync sign-in user to Brevo:", err)
                })

                if (account?.provider === "google" && user.id) {
                    prisma.user.updateMany({
                        where: { id: user.id, emailVerified: null },
                        data: { emailVerified: new Date() },
                    }).catch((err) => {
                        console.error("Failed to mark emailVerified on Google signIn:", err)
                    })
                }
            }
        },
        async createUser({ user }) {
            if (user?.email) {
                addSubscriberToBrevoRegisteredList({
                    email: user.email,
                    name: user.name,
                }).catch((err) => {
                    console.error("Failed to sync created user to Brevo:", err)
                })
            }
        },
    },
    session: {
        strategy: "jwt",
    },
})

export { handlers, auth, signIn, signOut }

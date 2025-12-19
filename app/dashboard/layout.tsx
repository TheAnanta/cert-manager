'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LayoutDashboard, FileBadge, Image as ImageIcon, Users, Settings } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading, logout } = useAuth()
    const router = useRouter()

    const ALLOWED_EMAIL = 'manas@theananta.in';

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
            } else if (user.email?.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
                // Not authorized, sign out and redirect
                logout()
                router.push('/login?error=unauthorized')
            }
        }
    }, [user, loading, router, logout])

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center font-bold text-2xl">Loading...</div>
    }

    if (!user) {
        return null // Will redirect
    }

    const handleLogout = async () => {
        await logout()
        router.push('/login')
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Link
                        href="/dashboard"
                        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                    >
                        <FileBadge className="h-4 w-4 transition-all group-hover:scale-110" />
                        <span className="sr-only">Ananta Certs</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="sr-only">Dashboard</span>
                    </Link>
                    <Link
                        href="/dashboard/events"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <Users className="h-5 w-5" />
                        <span className="sr-only">Events</span>
                    </Link>
                    <Link
                        href="/dashboard/templates"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <ImageIcon className="h-5 w-5" />
                        <span className="sr-only">Templates</span>
                    </Link>
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Link
                        href="#"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Link>
                </nav>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <div className="flex-1">
                        <h1 className="text-xl font-semibold">Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleLogout}>Log out</Button>
                    </div>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

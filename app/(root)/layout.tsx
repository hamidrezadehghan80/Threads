import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import {ClerkProvider} from "@clerk/nextjs";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftsideBar from "@/components/shared/LeftsideBar";
import RightsideBar from "@/components/shared/RightsideBar";


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title : "Threads",
    description : "A Next.js 13 meta threads application",
}

export default function RootLayout({children,}: { children: React.ReactNode; }) {

  return (
      <ClerkProvider>
          <html lang="en">
            <body className={inter.className}>
                <Topbar/>
                <main className={"flex flex-row"}>
                    <LeftsideBar/>
                        <section className={"main-container"}>
                            <div className={"w-full max-w-4xl"}>
                                {children}
                            </div>
                        </section>
                    <RightsideBar/>
                </main>
                <Bottombar/>
            </body>
          </html>
      </ClerkProvider>
  );
}

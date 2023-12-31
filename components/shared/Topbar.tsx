"use client"
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {SignedIn, SignOutButton, OrganizationSwitcher, SignInButton, SignedOut} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {dark} from "@clerk/themes";

const Topbar = (props) => {

    const router = useRouter();

    return(
        <nav className={"topbar"}>
            <Link href={"/"} className={"flex item-center gap-4"}>
                <Image
                    src={"/assets/logo.svg"}
                    alt ={"logo"}
                    width={28}
                    height={28}
                />
                <p className={"text-heading3-bold text-light-1 max-xs:hidden"}>
                    Threads
                </p>
            </Link>
            <div className={"flex items-center gap-1"}>
                <div className={"block md:hidden"}>
                    <SignedIn>
                        <SignOutButton signOutCallback={() => router.push("/sign-in")}>
                            <div className={"flex cursor-pointer"}>
                                <Image
                                    src={"/assets/logout.svg"}
                                    alt={"logout"}
                                    width={24}
                                    height={24}
                                />
                            </div>
                        </SignOutButton>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton signInCallback={() => router.push("/sign-in")}>
                            <div className={"flex cursor-pointer"}>
                                <Image
                                    src={"/assets/sign-in.svg"}
                                    alt={"sign in"}
                                    width={24}
                                    height={24}
                                />
                            </div>
                        </SignInButton>
                    </SignedOut>
                </div>
                <OrganizationSwitcher
                    appearance={{
                        baseTheme : dark,
                        elements: {
                            organizationSwitcherTrigger : "py-2 px-4"
                        }
                    }}
                />
            </div>
        </nav>
    )
}

export default Topbar
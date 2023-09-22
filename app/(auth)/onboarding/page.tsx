import React from "react";
import AccountProfile from "@/components/forms/AccountProfile";
import {currentUser} from "@clerk/nextjs";

const Page = async () => {

    const user = await currentUser();

    const userInfo = {}; //come from database

    const user_data = {
        id: user?.id,
        objectId: userInfo?._id,
        username: userInfo?.username || user?.username,
        name: userInfo?.name || user?.name || "",
        bio: userInfo?.bio || "",
        image: userInfo?.image || user?.imageUrl,
    }

    return(
        <main className={"mx-auto flex max-w-3xl flex-col justify-start px-10 py-20"}>
            <h1 className={"head-text"}>
                Onboarding
            </h1>
            <p className={"mt-3 text-base-regular text-light-2"}>
                Complete your profile to use Threads
            </p>

            <section className={"mt-9 bg-dark-2 p-10"}>
                <AccountProfile
                    user={user_data}
                    btn_text={"Continue"}
                />
            </section>

        </main>
    )
}

export default Page
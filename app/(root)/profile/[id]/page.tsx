import {currentUser} from "@clerk/nextjs";
import {redirect} from "next/navigation";
import {fetchUser} from "@/lib/actions/user.actions";
import Profile_header from "@/components/shared/profile_header";
import {Tabs, TabsList, TabsContent, TabsTrigger} from "@/components/ui/tabs";
import {profileTabs} from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";


const Page = async ({params} : {params : {id:string} }) => {

    const user = await currentUser();

    if(!user) {
        return null;
    }

    const userInfo = await fetchUser(params.id);

    // if (!userInfo.onboarded) redirect("/onboarding");


    return(
        <section>
            <Profile_header
                user_id={userInfo.id}
                currentUser_id={user.id}
                name={userInfo.name}
                username={userInfo.username}
                image={userInfo.image}
                bio={userInfo.bio}
            />

            <div className={"mt-9"}>
                <Tabs defaultValue={"threads"} className={"w-full"}>
                    <TabsList className={"tab"}>
                        {
                            profileTabs.map((tab) => (
                                <TabsTrigger key={tab.label} value={tab.value} className={"tab"}>
                                    <Image
                                        src={tab.icon}
                                        alt={tab.label}
                                        width={24}
                                        height={24}
                                        className={"object-contain"}
                                    />
                                    <p className={"max-sm:hidden"}>
                                        {tab.label}
                                    </p>
                                    {tab.label === "Threads" && (
                                        <p className={"ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2"}>
                                            {userInfo?.threads?.length}
                                        </p>
                                    )}
                                </TabsTrigger>
                            ))
                        }
                    </TabsList>
                    {
                        profileTabs.map((tab) => (
                            <TabsContent key={`content ${tab.label}`} value={tab.value} className={"w-full text-light-1"}>
                                <ThreadsTab
                                    currentUserId={user.id}
                                    userId={userInfo.id}
                                    accountType={"User"}
                                />
                            </TabsContent>
                        ))
                    }
                </Tabs>
            </div>
        </section>
    )
}

export default Page
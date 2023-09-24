import React from "react";
import {fetchUserThreads} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";
import ThreadCard from "@/components/cards/ThreadCard";
import {fetchCommunityPosts} from "@/lib/actions/community.actions";

interface Params {
    currentUserId : string;
    userId : string;
    accountType : string;
}

const ThreadsTab = async ({currentUserId, userId, accountType } : Params) => {

    let result : any;

    if (accountType === "Community"){
        result = await fetchCommunityPosts(userId);
    }else{
        result = await fetchUserThreads(userId);
    }


    if (!result) redirect("/");

    return(
        <section className={"mt-9 flex flex-col gap-10"}>
            {result.threads.map((thread : any) => (
                <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentuserId={currentUserId || ""}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={
                        accountType === "User" ? {
                            name: result.name,
                            image: result.image,
                            id: result.id
                        } : {
                            name : thread.author.name,
                            image : thread.author.image,
                            id : thread.author.id
                        }
                    }
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                />
            ))}
        </section>
    )
}

export default ThreadsTab
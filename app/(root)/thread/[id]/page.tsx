import ThreadCard from "@/components/cards/ThreadCard";
import {currentUser} from "@clerk/nextjs";
import {fetchUser} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";
import {fetchThreadById} from "@/lib/actions/thread.actions";
import Comment from "@/components/forms/comment";

const Page = async ({params} : {params : {id : string}}) => {

    if(!params.id) return null;

    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);
    if(!userInfo.onboarded) redirect("/onboarding");

    const thread = await fetchThreadById(params.id)

    return(
        <section className={"relative"}>
            <div>
                <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentuserId={user?.id || ""}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                />
            </div>
            <div className={"mt-7"}>
                <Comment
                    thread_id={thread._id}
                    current_user_image={userInfo.image}
                    current_userId={JSON.stringify(userInfo._id)}
                />
            </div>

            <div className={"mt-10"}>
                {thread.children.map((thread_child : any) => (
                    <ThreadCard
                        key={thread_child._id}
                        id={thread_child._id}
                        currentuserId={thread_child?.id || ""}
                        parentId={thread_child.parentId}
                        content={thread_child.text}
                        author={thread_child.author}
                        community={thread_child.community}
                        createdAt={thread_child.createdAt}
                        comments={thread_child.children}
                        isComment={true}
                    />
                ))}
            </div>
        </section>
    );
}

export default Page
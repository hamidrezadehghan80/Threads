import {fetchThreads} from "@/lib/actions/thread.actions";
import {currentUser} from "@clerk/nextjs";
import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";


export default async function Page({searchParams} : { searchParams: { [key: string]: string | undefined };}) {

    let pageNumber = searchParams.page ? +searchParams.page : 1;


    const user = await currentUser();

    const result = await fetchThreads(pageNumber, 20);

    // console.log(result.threads[0].author);


    return (
        <>
            <h1 className={"head-text text-left"}>
                Home
            </h1>
            <section className={"mt-9 flex flex-col gap-10"}>
                {result.threads.length ===0 ? (
                    <p className={"no-result"}>
                        No threads found!!
                    </p>
                ): (
                    <>
                        {result.threads.map((thread) => (
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
                        ))}
                    </>
                )}
            </section>

            <Pagination pageNumber={pageNumber} isNext={result.isNext} path={""}/>
        </>

    )
}
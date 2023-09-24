import {currentUser} from "@clerk/nextjs";
import {redirect} from "next/navigation";
import {fetchUser, fetchUsers} from "@/lib/actions/user.actions";
import UserCard from "@/components/cards/UserCard";
import {fetchCommunities} from "@/lib/actions/community.actions";
import CommunityCard from "@/components/cards/communitycard";
import SearchBar from "@/components/shared/SearchBar";
import Pagination from "@/components/shared/Pagination";


const Page = async ({searchParams} : { searchParams : { [key: string]: string | undefined }}) => {

    let pageNumber = searchParams.page ? +searchParams.page : 1;

    const user = await currentUser();

    if(!user) {
        return null;
    }

    const userInfo = await fetchUser(user.id);

    if (!userInfo.onboarded || !userInfo) redirect("/onboarding");

    // Fetch all Communities
    const result_communities = await fetchCommunities({
        searchString : searchParams.search,
        pageNumber : pageNumber,
        pageSize : 12,
    })

    return(
        <section>
            <h1 className={"head-text mb-10"}>
                Search
            </h1>

            <SearchBar type={"communities"}/>

            <div className={"mt-10 flex flex-wrap gap-9"}>
                {
                    result_communities.communities.length === 0 ? (
                        <p className={"no-result"}>No Communities</p>
                    ) : (
                        <>
                            {result_communities?.communities.map((community) => (
                                <CommunityCard
                                    key={community.id}
                                    id={community.id}
                                    name={community.name}
                                    username={community.username}
                                    imgUrl={community.image}
                                    bio={community.bio}
                                    members={community.members}
                                />
                            ))}
                        </>
                    )
                }
            </div>

            <Pagination pageNumber={pageNumber} isNext={result_communities.isNext} path={"communities"}/>
        </section>
    )
}

export default Page
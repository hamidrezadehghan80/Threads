import {currentUser} from "@clerk/nextjs";
import {redirect} from "next/navigation";
import {fetchUser, fetchUsers} from "@/lib/actions/user.actions";
import UserCard from "@/components/cards/UserCard";
import SearchBar from "../../../components/shared/SearchBar";
import Pagination from "@/components/shared/Pagination";



const Page = async ({searchParams} : { searchParams : { [key: string]: string | undefined }}) => {

    let pageNumber = searchParams.page ? +searchParams.page : 1;

    const user = await currentUser();

    if(!user) {
        return null;
    }

    const userInfo = await fetchUser(user.id);

    if (!userInfo?.onboarded || !userInfo) redirect("/onboarding");

    console.log(pageNumber);

    // Fetch all users
    const result_users = await fetchUsers({
        userId : user.id,
        searchStr : searchParams.search,
        pageNumber : pageNumber,
        pageSize : 20,

    })

    return(
        <section>
            <h1 className={"head-text mb-10"}>
                Search
            </h1>

            <SearchBar type={"search"}/>

            <div className={"mt-10 flex flex-col gap-9"}>
                {
                    result_users.users.length === 0 ? (
                        <p className={"no-result"}>No users</p>
                    ) : (
                        <>
                            {result_users?.users.map((person) => (
                                <UserCard
                                    key={person.id}
                                    id={person.id}
                                    name={person.name}
                                    username={person.username}
                                    image={person.image}
                                    personType={"User"}
                                />
                            ))}
                        </>
                    )
                }
            </div>

            <Pagination pageNumber={pageNumber} isNext={result_users.isNext} path={"search"}/>
        </section>
    )
}

export default Page
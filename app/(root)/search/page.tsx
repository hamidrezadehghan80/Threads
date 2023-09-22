import {currentUser} from "@clerk/nextjs";
import {redirect} from "next/navigation";
import {fetchUser, fetchUsers} from "@/lib/actions/user.actions";
import UserCard from "@/components/cards/UserCard";


const Page = async () => {

    const user = await currentUser();

    if(!user) {
        return null;
    }

    const userInfo = await fetchUser(user.id);

    if (!userInfo.onboarded) redirect("/onboarding");

    // Fetch all users
    const result_users = await fetchUsers({
        userId : user.id,
        searchStr : "",
        pageNumber : 1,
        pageSize : 25,

    })

    return(
        <section>
            <h1 className={"head-text mb-10"}>
                Search
            </h1>

            <div className={"mt-15 flex flex-col gap-9"}>
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
        </section>
    )
}

export default Page
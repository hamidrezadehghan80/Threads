"use client"
import React, {useState, useEffect} from "react";
import {Input} from "@/components/ui/input";
import Image from "next/image";
import {useRouter} from "next/navigation";

function SearchBar({type} : {type : string}) {
    const [search_text, setSearch_text] = useState("");
    const router = useRouter();

    useEffect(() => {
        const delay_search = setTimeout(() => {
            if(search_text){
                router.push(`/${type}?search=${search_text}`);
            }else {
                router.push(`/${type}`);
            }
        }, 300)

        return () => clearTimeout(delay_search);
    }, [search_text, type]);


    return(
        <div className='searchbar'>
            <Image
                src='/assets/search-gray.svg'
                alt={'search'}
                width={24}
                height={24}
                className='object-contain'
            />
            <Input
                id='text'
                value={search_text}
                onChange={(e) => setSearch_text(e.target.value)}
                placeholder={`${
                    type !== "search" ? "Search communities" : "Search users"
                }`}
                className='no-focus searchbar_input'
            />
        </div>
    )
}

export default SearchBar;
"use client"
import React from "react";
import {deleteThread} from "@/lib/actions/thread.actions";
import {usePathname, useRouter} from "next/navigation";
import Image from "next/image";

interface Props {
    userId : string;
    authorId : string;
    id : string;
    parentId : string | null;
    isComment ?: boolean;
}

const DeleteIcon = ({userId, authorId, id, parentId, isComment} : Props) => {

    const pathname = usePathname();
    const router = useRouter();

    if(pathname === "/" || userId!==authorId) return null;


    return(
        <Image
            src='/assets/delete-gray.svg'
            alt='delete icon'
            width={24}
            height={24}
            className='cursor-pointer object-contain'
            onClick={async () => {
                await deleteThread(JSON.parse(id), pathname);
                if (!parentId || !isComment) {
                    router.push("/");
                }
            }}
        />
    )
}

export default DeleteIcon
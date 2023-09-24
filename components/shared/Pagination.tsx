"use client";
import React from "react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

const Pagination = ({pageNumber, isNext, path} : {pageNumber : number, isNext: boolean, path:string}) => {

    if(pageNumber === 1 && !isNext) return null;

    const router = useRouter();

    const handle_pagination = (type : string) => {

        let nextPageNumber;

        if(type === "prev"){
            nextPageNumber = Math.max(1, pageNumber-1);
        } else {
            nextPageNumber = pageNumber + 1;
        }

        if (nextPageNumber === 1){
            router.push(`/${path}`);
        }else {
            router.push(`/${path}?page=${nextPageNumber}`);
        }

    }

    return(
        <div className={"pagination"}>
            <Button
                className={"!text-small-regular text-light-2"}
                disabled={pageNumber === 1}
                onClick={() => handle_pagination("prev")}
            >
                Prev
            </Button>
            <p className='text-small-semibold text-light-1'>{pageNumber}</p>
            <Button
                className={"!text-small-regular text-light-2"}
                disabled={!isNext}
                onClick={() => handle_pagination("next")}
            >
                Next
            </Button>
        </div>
    )
}

export default Pagination
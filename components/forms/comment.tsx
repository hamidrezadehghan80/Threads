"use client"

import React from "react";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CommentValidation} from "@/lib/validations/thread";
import {addCommentforThread, createThread} from "@/lib/actions/thread.actions";
import {usePathname, useRouter} from "next/navigation";
import {Input} from "@/components/ui/input";
import Image from "next/image";
import * as z from "Zod";

interface Params {
    thread_id: string;
    current_user_image: string;
    current_userId: string;
}

const Comment = ({thread_id, current_user_image, current_userId} : Params) => {

    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues : {
            comment : "",
        }
    });

    const onSubmit = async (values : z.infer<typeof CommentValidation>) => {

        await addCommentforThread(
            thread_id,
            values.comment,
            JSON.parse(current_userId),
            pathname
        );

        form.reset();

    }



    return(
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={"comment-form"}
            >
                <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                        <FormItem className={"flex items-center gap-3 w-full"}>
                            <FormLabel>
                                <Image
                                    src={current_user_image}
                                    alt={"user profile"}
                                    width={48}
                                    height={48}
                                    className={"rounded-full object-cover"}
                                />
                            </FormLabel>
                            <FormControl className={"border-none bg-transparent"}>
                                <Input
                                    type={"text"}
                                    placeholder={"Comment..."}
                                    {...field}
                                    className={"no-focus text-light-1 outline-none"}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type={"submit"} className={"comment-form_btn"}>
                    Reply
                </Button>
            </form>
        </Form>
    )
}

export default Comment;
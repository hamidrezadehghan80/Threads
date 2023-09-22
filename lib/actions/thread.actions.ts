"use server"

import {connectToDB} from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";

interface Params {
    text : string,
    author : string,
    communityId: string | null,
    path : string,
}

export async function createThread({text, author, communityId, path} : Params) {
    
    try {
        await connectToDB();

        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        });

        // Update User model
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id },
        });

        console.log("thread saved");

        revalidatePath(path);
    }catch (e) {
        throw new Error(`Failed to create thread: ${e.message}`)
    }
    

}

export async function fetchThreads(pageNumber: number = 1, pageSize: number = 20) {
    await connectToDB();

    //calculate index of threads that we have to show

    const skip_count = (pageNumber - 1) * pageSize;

    //Fetch threads that have no parents
    const threads_query = Thread.find({
        parentId : {
            $in: [null, undefined]
        }
    }).sort({createdAt: "desc"})
        .skip(skip_count)
        .limit(pageSize)
        .populate({path : "author", model: User})
            .populate({
                path: "children",
                populate : {
                    path: "author",
                    model : User
        }})

    const totalPostsCount = await Thread.countDocuments(
        {parentId : {
            $in: [null, undefined]
        }}
    );

    const threads = await threads_query.exec();
    const isNext = totalPostsCount > skip_count + threads.length;

    return {threads, isNext};
}

export async function fetchThreadById(thread_id : string) {
    try {
        await connectToDB();

        // populate community

        const thread = await Thread.findById(thread_id)
            .populate({
                path : "author",
                model: User,
                select: "_id id name image"
            })
            .populate({
                path: "children",
                populate:[
                    {
                        path: "author",
                        model: User,
                        select: "_id id name parentId image"
                    },
                    {
                        path: "children",
                        model: Thread,
                        populate: {
                            path: "author",
                            model: User,
                            select: "_id id name parentId image"
                        }
                    }
                ]
            }).exec();
        return thread
    }catch (e: any) {
        throw new Error(`failed to fetch thread: ${e.message}`);
    }
};

export async function addCommentforThread(thread_id : string, comment_text: string, user_id: string, path: string) {
    try {
        await connectToDB();

        //find original thread
        const thread = await Thread.findById(thread_id);
        if(!thread){
            console.log("Thread not found")
            throw new Error("Thread not found");
        }

        //create new thread
        const comment_thread = new Thread({
            text: comment_text,
            author: user_id,
            parentId: thread_id,
        })

        //save comment
        const saved_comment = await comment_thread.save();

        console.log(saved_comment);

        thread.children.push(saved_comment._id);

        //save thread
        await thread.save();

        revalidatePath(path);

    }catch (e : any) {
        throw new Error(`Failed to add comment to thread: ${e.message}`);
    }


}
"use server"

import {connectToDB} from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import Community from "@/lib/models/community.model";
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

        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );

        const createdThread = await Thread.create({
            text,
            author,
            community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
        });

        // Update User model
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id },
        });

        if (communityIdObject) {
            // Update Community model
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: { threads: createdThread._id },
            });
        }

        // console.log("thread saved");

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
    const threads_query = Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: "desc" })
        .skip(skip_count)
        .limit(pageSize)
        .populate({
            path: "author",
            model: User,
        })
        .populate({
            path: "community",
            model: Community,
        })
        .populate({
            path: "children", // Populate the children field
            populate: {
                path: "author", // Populate the author field within children
                model: User,
                select: "_id name parentId image", // Select only _id and username fields of the author
            },
        });


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
                path: "author",
                model: User,
                select: "_id id name image",
            }) // Populate the author field with _id and username
            .populate({
                path: "community",
                model: Community,
                select: "_id id name image",
            }) // Populate the community field with _id and name
            .populate({
                path: "children", // Populate the children field
                populate: [
                    {
                        path: "author", // Populate the author field within children
                        model: User,
                        select: "_id id name parentId image", // Select only _id and username fields of the author
                    },
                    {
                        path: "children", // Populate the children field within children
                        model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
                        populate: {
                            path: "author", // Populate the author field within nested children
                            model: User,
                            select: "_id id name parentId image", // Select only _id and username fields of the author
                        },
                    },
                ],
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

        // console.log(saved_comment);

        thread.children.push(saved_comment._id);

        //save thread
        await thread.save();

        revalidatePath(path);

    }catch (e : any) {
        throw new Error(`Failed to add comment to thread: ${e.message}`);
    }


}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({ parentId: threadId });

    const descendantThreads = [];
    for (const childThread of childThreads) {
        const descendants = await fetchAllChildThreads(childThread._id);
        descendantThreads.push(childThread, ...descendants);
    }

    return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
    try {
        await connectToDB();

        // Find the thread to be deleted (the main thread)
        const mainThread = await Thread.findById(id).populate("author community");

        if (!mainThread) {
            throw new Error("Thread not found");
        }

        // Fetch all child threads and their descendants recursively
        const descendantThreads = await fetchAllChildThreads(id);

        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantThreadIds = [
            id,
            ...descendantThreads.map((thread) => thread._id),
        ];

        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.community?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        // Recursively delete child threads and their descendants
        await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        // Update Community model
        await Community.updateMany(
            { _id: { $in: Array.from(uniqueCommunityIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to delete thread: ${error.message}`);
    }
}